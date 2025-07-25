// This is the root page that redirects to the default locale.
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
