using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace IceRelay.Api.Helpers;

public sealed class HttpResponseHeadersMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        await next(context);
        var response = context.GetHttpResponseData();
        if (response is null) return;

        response.Headers.Add("X-Content-Type-Options", "nosniff");
        response.Headers.Add("Cache-Control", "no-store");
        response.Headers.Add("X-Robots-Tag", "noindex, nofollow");
    }
}
