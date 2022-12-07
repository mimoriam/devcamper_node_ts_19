import geo, { Options } from "node-geocoder";

const options: Options = {
  provider: 'mapquest',
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = geo(options);

export { geocoder };
