import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import routes from './routes/index.tsx';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Suspense
      fallback={
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <p className="text-4xl">Loading ...</p>
        </div>
      }
    >
      <RouterProvider router={routes} />
    </Suspense>
  </Provider>
  // <StrictMode>
  //   <App />
  // </StrictMode>,
)
