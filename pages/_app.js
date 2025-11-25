import '../styles/globals.css'; // Make sure this path points to your css file

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}