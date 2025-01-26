import { Outlet } from "react-router"

export default function Layout() {
    return (
      <div id="app" className="h-full bg-gray-100">
        <div className="max-w-3xl mx-auto h-full">
          <Outlet />
        </div>
      </div>
    );
}