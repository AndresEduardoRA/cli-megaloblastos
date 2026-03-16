export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-6xl font-bold text-amber-600">404</h1>

      <h2 className="text-2xl font-semibold mt-4 text-neutral-700 dark:text-neutral-200">
        Página no encontrada
      </h2>

      <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-md">
        La página que estás buscando no existe o fue movida.
      </p>

      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
