export const iceCoverageStates = [
  { name: 'Minnesota', code: 'MN', latitude: 46, longitude: -94.5 },
  { name: 'Wisconsin', code: 'WI', latitude: 44.7, longitude: -89.8 },
  { name: 'Michigan', code: 'MI', latitude: 44.3, longitude: -85.6 },
  { name: 'Iowa', code: 'IA', latitude: 42, longitude: -93.5 },
  { name: 'North Dakota', code: 'ND', latitude: 47.5, longitude: -100.5 },
  { name: 'South Dakota', code: 'SD', latitude: 44.5, longitude: -100 },
] as const;

export const officialIceSafetyResources = [
  {
    state: 'Minnesota',
    url: 'https://www.dnr.state.mn.us/safety/ice/index.html',
  },
  {
    state: 'Wisconsin',
    url: 'https://dnr.wisconsin.gov/Education/OutdoorSkills/IceSafety',
  },
  {
    state: 'North Dakota',
    url: 'https://gf.nd.gov/ice-safety',
  },
] as const;
