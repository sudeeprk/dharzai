"use server";

import { Thinkroman } from "@thinkroman/api";

const token = process.env.S3_TOKEN as string;

const tr = new Thinkroman({
  key: token,
});

export const getPresignedUrl = async (key: string) => {
  return tr.storage.r2.uploadUrl({
    key: `images/${key}`,
  });
};
