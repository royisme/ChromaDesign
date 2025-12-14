import { jsxs, jsx } from "react/jsx-runtime";
import { queryOptions, QueryClient } from "@tanstack/react-query";
import { useRouter, useMatch, rootRouteId, ErrorComponent, Link, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, redirect, lazyRouteComponent, notFound, createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import axios from "redaxios";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { json } from "@tanstack/router-core/ssr/client";
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });
  console.error(error);
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx(ErrorComponent, { error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
          },
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Try Again"
        }
      ),
      isRoot ? /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Home"
        }
      ) : /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          onClick: (e) => {
            e.preventDefault();
            window.history.back();
          },
          children: "Go Back"
        }
      )
    ] })
  ] });
}
function NotFound({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-gray-600 dark:text-gray-400", children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." }) }),
    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.history.back(),
          className: "bg-emerald-500 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Go back"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Start Over"
        }
      )
    ] })
  ] });
}
const appCss = "/assets/app-DEL02cVE.css";
const seo = ({
  title,
  description,
  keywords,
  image
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@tannerlinsley" },
    { name: "twitter:site", content: "@tannerlinsley" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...image ? [
      { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "og:image", content: image }
    ] : []
  ];
  return tags;
};
const Route$g = createRootRouteWithContext()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({
        title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `
      })
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  errorComponent: (props) => {
    return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(DefaultCatchBoundary, { ...props }) });
  },
  notFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsxs("div", { className: "p-2 flex gap-2 text-lg", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            activeProps: {
              className: "font-bold"
            },
            activeOptions: { exact: true },
            children: "Home"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/posts",
            activeProps: {
              className: "font-bold"
            },
            children: "Posts"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/users",
            activeProps: {
              className: "font-bold"
            },
            children: "Users"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/route-a",
            activeProps: {
              className: "font-bold"
            },
            children: "Pathless Layout"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/deferred",
            activeProps: {
              className: "font-bold"
            },
            children: "Deferred"
          }
        ),
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/this-route-does-not-exist",
            activeProps: {
              className: "font-bold"
            },
            children: "This Route Does Not Exist"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      children,
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-right" }),
      /* @__PURE__ */ jsx(ReactQueryDevtools, { buttonPosition: "bottom-left" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const Route$f = createFileRoute("/redirect")({
  beforeLoad: async () => {
    throw redirect({
      to: "/posts"
    });
  }
});
const $$splitComponentImporter$c = () => import("./deferred-Dcu8z9xc.js");
const deferredQueryOptions = () => queryOptions({
  queryKey: ["deferred"],
  queryFn: async () => {
    await new Promise((r) => setTimeout(r, 3e3));
    return {
      message: `Hello deferred from the server!`,
      status: "success",
      time: /* @__PURE__ */ new Date()
    };
  }
});
const Route$e = createFileRoute("/deferred")({
  loader: ({
    context
  }) => {
    context.queryClient.prefetchQuery(deferredQueryOptions());
  },
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./_pathlessLayout-BKuQagRO.js");
const Route$d = createFileRoute("/_pathlessLayout")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const DEPLOY_URL = "http://localhost:3000";
const usersQueryOptions = () => queryOptions({
  queryKey: ["users"],
  queryFn: () => axios.get(DEPLOY_URL + "/api/users").then((r) => r.data).catch(() => {
    throw new Error("Failed to fetch users");
  })
});
const userQueryOptions = (id) => queryOptions({
  queryKey: ["users", id],
  queryFn: () => axios.get(DEPLOY_URL + "/api/users/" + id).then((r) => r.data).catch(() => {
    throw new Error("Failed to fetch user");
  })
});
const $$splitComponentImporter$a = () => import("./users.route-C7QlnIPq.js");
const Route$c = createFileRoute("/users")({
  loader: async ({
    context
  }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions());
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const fetchPosts_createServerFn_handler = createSsrRpc("cbb8ca69048418e62742f2c511faa56326b80ace384144a35bb3e0bf5e8124be");
const fetchPosts = createServerFn({
  method: "GET"
}).handler(fetchPosts_createServerFn_handler, async () => {
  console.info("Fetching posts...");
  return axios.get("https://jsonplaceholder.typicode.com/posts").then((r) => r.data.slice(0, 10));
});
const postsQueryOptions = () => queryOptions({
  queryKey: ["posts"],
  queryFn: () => fetchPosts()
});
const fetchPost_createServerFn_handler = createSsrRpc("0029094260fc8f554fa3ac223696de0e9591567ec6420250e896c91244c812c5");
const fetchPost = createServerFn({
  method: "GET"
}).inputValidator((d) => d).handler(fetchPost_createServerFn_handler, async ({
  data
}) => {
  console.info(`Fetching post with id ${data}...`);
  const post = await axios.get(`https://jsonplaceholder.typicode.com/posts/${data}`).then((r) => r.data).catch((err) => {
    console.error(err);
    if (err.status === 404) {
      throw notFound();
    }
    throw err;
  });
  return post;
});
const postQueryOptions = (postId) => queryOptions({
  queryKey: ["post", postId],
  queryFn: () => fetchPost({
    data: postId
  })
});
const $$splitComponentImporter$9 = () => import("./posts.route-A_wvQwyZ.js");
const Route$b = createFileRoute("/posts")({
  loader: async ({
    context
  }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
  head: () => ({
    meta: [{
      title: "Posts"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-BwMT9QHg.js");
const Route$a = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./users.index-D5GT_T1K.js");
const Route$9 = createFileRoute("/users/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./posts.index-DU8oxB5n.js");
const Route$8 = createFileRoute("/posts/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitNotFoundComponentImporter$1 = () => import("./users._userId-DWRHA_Qr.js");
const $$splitComponentImporter$5 = () => import("./users._userId-C4xvBKs7.js");
const Route$7 = createFileRoute("/users/$userId")({
  loader: async ({
    context,
    params: {
      userId
    }
  }) => {
    await context.queryClient.ensureQueryData(userQueryOptions(userId));
  },
  errorComponent: UserErrorComponent,
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
function UserErrorComponent({
  error
}) {
  return /* @__PURE__ */ jsx(ErrorComponent, { error });
}
const $$splitComponentImporter$4 = () => import("./posts._postId-DWKRtQXe.js");
const $$splitNotFoundComponentImporter = () => import("./posts._postId-X_ARNBQk.js");
const Route$6 = createFileRoute("/posts/$postId")({
  loader: async ({
    params: {
      postId
    },
    context
  }) => {
    const data = await context.queryClient.ensureQueryData(postQueryOptions(postId));
    return {
      title: data.title
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: loaderData ? [{
      title: loaderData.title
    }] : void 0
  }),
  errorComponent: PostErrorComponent,
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
function PostErrorComponent({
  error
}) {
  return /* @__PURE__ */ jsx(ErrorComponent, { error });
}
const Route$5 = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.info("Fetching users... @", request.url);
        const res = await axios.get(
          "https://jsonplaceholder.typicode.com/users"
        );
        const list = res.data.slice(0, 10);
        return json(
          list.map((u) => ({ id: u.id, name: u.name, email: u.email }))
        );
      }
    }
  }
});
const $$splitComponentImporter$3 = () => import("./_nested-layout-CzbpeJPs.js");
const Route$4 = createFileRoute("/_pathlessLayout/_nested-layout")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./posts_._postId.deep-BWiHUnu7.js");
const $$splitErrorComponentImporter = () => import("./posts_._postId.deep-CuZ0gIpc.js");
const Route$3 = createFileRoute("/posts_/$postId/deep")({
  loader: async ({
    params: {
      postId
    },
    context
  }) => {
    const data = await context.queryClient.ensureQueryData(postQueryOptions(postId));
    return {
      title: data.title
    };
  },
  head: ({
    loaderData
  }) => ({
    meta: loaderData ? [{
      title: loaderData.title
    }] : void 0
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const Route$2 = createFileRoute("/api/users/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        console.info(`Fetching users by id=${params.id}... @`, request.url);
        try {
          const res = await axios.get(
            "https://jsonplaceholder.typicode.com/users/" + params.id
          );
          return json({
            id: res.data.id,
            name: res.data.name,
            email: res.data.email
          });
        } catch (e) {
          console.error(e);
          return json({ error: "User not found" }, { status: 404 });
        }
      }
    }
  }
});
const $$splitComponentImporter$1 = () => import("./route-b-CsHX6n6-.js");
const Route$1 = createFileRoute("/_pathlessLayout/_nested-layout/route-b")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./route-a-xd-e2Wm0.js");
const Route = createFileRoute("/_pathlessLayout/_nested-layout/route-a")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const RedirectRoute = Route$f.update({
  id: "/redirect",
  path: "/redirect",
  getParentRoute: () => Route$g
});
const DeferredRoute = Route$e.update({
  id: "/deferred",
  path: "/deferred",
  getParentRoute: () => Route$g
});
const PathlessLayoutRoute = Route$d.update({
  id: "/_pathlessLayout",
  getParentRoute: () => Route$g
});
const UsersRouteRoute = Route$c.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => Route$g
});
const PostsRouteRoute = Route$b.update({
  id: "/posts",
  path: "/posts",
  getParentRoute: () => Route$g
});
const IndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$g
});
const UsersIndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => UsersRouteRoute
});
const PostsIndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => PostsRouteRoute
});
const UsersUserIdRoute = Route$7.update({
  id: "/$userId",
  path: "/$userId",
  getParentRoute: () => UsersRouteRoute
});
const PostsPostIdRoute = Route$6.update({
  id: "/$postId",
  path: "/$postId",
  getParentRoute: () => PostsRouteRoute
});
const ApiUsersRoute = Route$5.update({
  id: "/api/users",
  path: "/api/users",
  getParentRoute: () => Route$g
});
const PathlessLayoutNestedLayoutRoute = Route$4.update({
  id: "/_nested-layout",
  getParentRoute: () => PathlessLayoutRoute
});
const PostsPostIdDeepRoute = Route$3.update({
  id: "/posts_/$postId/deep",
  path: "/posts/$postId/deep",
  getParentRoute: () => Route$g
});
const ApiUsersIdRoute = Route$2.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => ApiUsersRoute
});
const PathlessLayoutNestedLayoutRouteBRoute = Route$1.update({
  id: "/route-b",
  path: "/route-b",
  getParentRoute: () => PathlessLayoutNestedLayoutRoute
});
const PathlessLayoutNestedLayoutRouteARoute = Route.update({
  id: "/route-a",
  path: "/route-a",
  getParentRoute: () => PathlessLayoutNestedLayoutRoute
});
const PostsRouteRouteChildren = {
  PostsPostIdRoute,
  PostsIndexRoute
};
const PostsRouteRouteWithChildren = PostsRouteRoute._addFileChildren(
  PostsRouteRouteChildren
);
const UsersRouteRouteChildren = {
  UsersUserIdRoute,
  UsersIndexRoute
};
const UsersRouteRouteWithChildren = UsersRouteRoute._addFileChildren(
  UsersRouteRouteChildren
);
const PathlessLayoutNestedLayoutRouteChildren = {
  PathlessLayoutNestedLayoutRouteARoute,
  PathlessLayoutNestedLayoutRouteBRoute
};
const PathlessLayoutNestedLayoutRouteWithChildren = PathlessLayoutNestedLayoutRoute._addFileChildren(
  PathlessLayoutNestedLayoutRouteChildren
);
const PathlessLayoutRouteChildren = {
  PathlessLayoutNestedLayoutRoute: PathlessLayoutNestedLayoutRouteWithChildren
};
const PathlessLayoutRouteWithChildren = PathlessLayoutRoute._addFileChildren(
  PathlessLayoutRouteChildren
);
const ApiUsersRouteChildren = {
  ApiUsersIdRoute
};
const ApiUsersRouteWithChildren = ApiUsersRoute._addFileChildren(
  ApiUsersRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  PostsRouteRoute: PostsRouteRouteWithChildren,
  UsersRouteRoute: UsersRouteRouteWithChildren,
  PathlessLayoutRoute: PathlessLayoutRouteWithChildren,
  DeferredRoute,
  RedirectRoute,
  ApiUsersRoute: ApiUsersRouteWithChildren,
  PostsPostIdDeepRoute
};
const routeTree = Route$g._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {})
  });
  setupRouterSsrQueryIntegration({
    router: router2,
    queryClient
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  NotFound as N,
  PostErrorComponent as P,
  Route$7 as R,
  userQueryOptions as a,
  Route$6 as b,
  postQueryOptions as c,
  Route$3 as d,
  postsQueryOptions as p,
  router as r,
  usersQueryOptions as u
};
