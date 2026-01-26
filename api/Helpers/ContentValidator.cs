using System.Text.RegularExpressions;

namespace IceRelay.Api.Helpers;

public static class ContentValidator
{
    // Comprehensive profanity list (expand as needed)
    private static readonly HashSet<string> ProfanityList = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "fuck", "shit", "damn", "ass", "bitch", "crap", "hell", "bastard",
        "asshole", "dick", "cock", "pussy", "cunt", "whore", "slut", "fag",
        "nigger", "nigga", "retard", "rape", "kill yourself", "kys"
    };

    // Spam detection patterns
    private static readonly List<Regex> SpamPatterns = new List<Regex>
    {
        new Regex(@"https?://", RegexOptions.IgnoreCase), // URLs
        new Regex(@"www\.", RegexOptions.IgnoreCase), // Web addresses
        new Regex(@"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"), // Email addresses
        new Regex(@"(\b\w+\b)(\s*\1){3,}", RegexOptions.IgnoreCase), // Repeated words (4+ times)
        new Regex(@"(.)\1{10,}"), // Same character repeated 10+ times
        new Regex(@"\$\d+|\d+\s*(?:dollars|bucks|USD)", RegexOptions.IgnoreCase), // Money amounts
        new Regex(@"\b(?:buy|sell|cheap|discount|offer|deal|click|visit|subscribe)\b", RegexOptions.IgnoreCase) // Spam keywords
    };

    public static ValidationResult ValidateText(string? text, string fieldName, int maxLength = 500)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return new ValidationResult { IsValid = true, CleanedText = string.Empty };
        }

        // Check length
        if (text.Length > maxLength)
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                ErrorMessage = $"{fieldName} exceeds maximum length of {maxLength} characters" 
            };
        }

        var cleaned = text.Trim();

        // Check for spam patterns
        foreach (var pattern in SpamPatterns)
        {
            if (pattern.IsMatch(cleaned))
            {
                return new ValidationResult 
                { 
                    IsValid = false, 
                    ErrorMessage = $"{fieldName} contains spam or inappropriate content" 
                };
            }
        }

        // Check for profanity
        var words = cleaned.ToLower().Split(new[] { ' ', ',', '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words)
        {
            if (ProfanityList.Contains(word))
            {
                return new ValidationResult 
                { 
                    IsValid = false, 
                    ErrorMessage = $"{fieldName} contains inappropriate language. Please keep content professional and family-friendly." 
                };
            }
        }

        // Check for leetspeak variations (basic)
        var normalized = cleaned
            .Replace("@", "a")
            .Replace("3", "e")
            .Replace("1", "i")
            .Replace("0", "o")
            .Replace("$", "s");

        var normalizedWords = normalized.ToLower().Split(new[] { ' ', ',', '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in normalizedWords)
        {
            if (ProfanityList.Contains(word))
            {
                return new ValidationResult 
                { 
                    IsValid = false, 
                    ErrorMessage = $"{fieldName} contains inappropriate language. Please keep content professional and family-friendly." 
                };
            }
        }

        // Sanitize special characters (keep basic punctuation)
        cleaned = Regex.Replace(cleaned, @"[^a-zA-Z0-9 .,!?'-]", "");

        // Remove excessive punctuation
        cleaned = Regex.Replace(cleaned, @"[.,!?'-]{4,}", "...");

        // Remove excessive spaces
        cleaned = Regex.Replace(cleaned, @"\s{2,}", " ").Trim();

        return new ValidationResult 
        { 
            IsValid = true, 
            CleanedText = cleaned 
        };
    }

    public static ValidationResult ValidateLakeName(string? lakeName)
    {
        if (string.IsNullOrWhiteSpace(lakeName))
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                ErrorMessage = "Lake name is required" 
            };
        }

        var result = ValidateText(lakeName, "Lake name", 100);
        if (!result.IsValid)
        {
            return result;
        }

        // Additional lake name specific checks
        if (result.CleanedText!.Length < 3)
        {
            return new ValidationResult 
            { 
                IsValid = false, 
                ErrorMessage = "Lake name must be at least 3 characters" 
            };
        }

        // Title case the lake name
        var titleCased = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(result.CleanedText.ToLower());
        
        return new ValidationResult 
        { 
            IsValid = true, 
            CleanedText = titleCased 
        };
    }
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public string? CleanedText { get; set; }
    public string? ErrorMessage { get; set; }
}
