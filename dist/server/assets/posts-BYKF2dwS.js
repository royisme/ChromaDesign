import { a as createServerRpc, c as createServerFn } from "../server.js";
import { notFound } from "@tanstack/react-router";
import axios from "redaxios";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const fetchPosts_createServerFn_handler = createServerRpc("cbb8ca69048418e62742f2c511faa56326b80ace384144a35bb3e0bf5e8124be", (opts, signal) => {
  return fetchPosts.__executeServer(opts, signal);
});
const fetchPosts = createServerFn({
  method: "GET"
}).handler(fetchPosts_createServerFn_handler, async () => {
  console.info("Fetching posts...");
  return axios.get("https://jsonplaceholder.typicode.com/posts").then((r) => r.data.slice(0, 10));
});
const fetchPost_createServerFn_handler = createServerRpc("0029094260fc8f554fa3ac223696de0e9591567ec6420250e896c91244c812c5", (opts, signal) => {
  return fetchPost.__executeServer(opts, signal);
});
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
export {
  fetchPost_createServerFn_handler,
  fetchPosts_createServerFn_handler
};
