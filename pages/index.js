// This file is intentionally structured this way to resolve a route conflict
// between the Pages Router and the App Router for the root path ('/').
// By not default-exporting a component, this file does not create a route.
// The homepage is now served from `src/app/page.tsx`.

function InactivePagesIndex() {
  return null;
}
