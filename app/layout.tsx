import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tu Aplicación',
  description: 'Descripción de tu aplicación',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { AppSidebar } from '../components/vistasShadcn/app-sidebar';
// import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
// import { SiteHeader } from '../components/vistasShadcn/site-header';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Tu Aplicación',
//   description: 'Descripción de tu aplicación',
// };

// interface RootLayoutProps {
//   children: React.ReactNode;
// }

// export default function RootLayout({ children }: RootLayoutProps) {
//   return (
//     <html lang="es">
//       <body className={`${inter.className} h-full`}>
//         <SidebarProvider>
//           <div className="flex h-screen bg-gray-100">
//             <AppSidebar variant="inset" />
//             <div className="flex-1 flex flex-col">
//               <SidebarInset className="flex-1"> {/* Asegúrate de que SidebarInset también tenga flex-1 */}
//                 <SiteHeader />
//                 <main className="flex-1 overflow-y-auto">  {/* Y el main */}
//                   {children}
//                 </main>
//               </SidebarInset>
//             </div>
//           </div>
//         </SidebarProvider>
//       </body>
//     </html>
//   );
// }