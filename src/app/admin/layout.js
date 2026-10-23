import '@fontsource-variable/unbounded';
import '@fontsource-variable/instrument-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../globals.css';
import './admin.css';

export const metadata = { title: { default: 'Admin', template: '%s · Admin' }, robots: { index: false, follow: false } };

// The admin is English and left-to-right whatever language the storefront uses.
export default function AdminRoot({ children }) {
  return <div dir="ltr" lang="en" className="admin-root">{children}</div>;
}
