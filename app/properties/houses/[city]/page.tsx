import { landingRoute } from "../../_landing/landing-route";

// SEO landing pages: /properties/houses/{city}. See lib/landing-pages.ts.
const route = landingRoute("houses");

// Rebuild hourly so counts and prices track the listings. Cities that gain
// listings after a deploy are still rendered on first request.
export const revalidate = 3600;

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
