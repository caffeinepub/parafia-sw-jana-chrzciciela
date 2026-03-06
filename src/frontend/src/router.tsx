/**
 * Lightweight client-side router using the History API.
 * Supports exact routes and parameterized routes like /aktualnosci/:id
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface RouterContextValue {
  pathname: string;
  navigate: (to: string) => void;
  push: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: "/",
  navigate: () => {},
  push: () => {},
});

const ParamsContext = createContext<Record<string, string>>({});

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePop() {
      setPathname(window.location.pathname);
    }
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, "", to);
    setPathname(to);
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate, push: navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function usePathname() {
  return useContext(RouterContext).pathname;
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  return useContext(ParamsContext) as T;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export function Link({
  to,
  children,
  className,
  onClick,
  ...props
}: LinkProps) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow modifier keys to open in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target === "_blank") return;
    e.preventDefault();
    navigate(to);
    onClick?.(e);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

interface RoutesProps {
  children: React.ReactNode;
}

export function Route(_props: RouteProps): null {
  return null;
}

/**
 * Match a route pattern against an actual pathname.
 * Returns null if no match, or an object with extracted params if match.
 */
function matchRoute(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function Routes({ children }: RoutesProps) {
  const { pathname } = useContext(RouterContext);

  const routes: RouteProps[] = [];
  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement<RouteProps>(child) &&
      (child.props as RouteProps).path !== undefined
    ) {
      routes.push(child.props as RouteProps);
    }
  });

  // Find first matching route (exact or parameterized), then wildcard
  let matchedParams: Record<string, string> = {};
  const match = (() => {
    for (const route of routes) {
      if (route.path === "*") continue;
      const params = matchRoute(route.path, pathname);
      if (params !== null) {
        matchedParams = params;
        return route;
      }
    }
    return routes.find((r) => r.path === "*");
  })();

  return (
    <ParamsContext.Provider value={matchedParams}>
      {match ? match.element : null}
    </ParamsContext.Provider>
  );
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}
