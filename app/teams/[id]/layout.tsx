// Server component wrapper for generateStaticParams
// Required for static export with dynamic routes

export function generateStaticParams() {
  // Return empty array - pages will be generated on-demand via client-side routing
  return [];
}

export const dynamicParams = true; // Allow dynamic params not returned by generateStaticParams

export default function TeamDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

