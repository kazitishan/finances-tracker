import fs from "fs";
import path from "path";
import { currentProfileDir } from "@/lib/profiles";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Uploaded images live in the signed-in profile's private/profiles/<id>/uploads and are served by
// src/app/uploads/[file]/route.js, so an item's `img` is "/uploads/<file>". These are the only files uploads are
// allowed to touch: a PNG or JPEG directly inside it.
const UPLOAD_FILE = /^[a-z0-9-]+\.(png|jpg)$/;
const UPLOAD_PATH = /^\/uploads\/([a-z0-9-]+\.(png|jpg))$/;

// Before uploads moved to private/, they were saved under public/<folder>/uploads.
const LEGACY_UPLOAD_PATH = /^\/(banks|investment|loans|subscriptions|insurance|insurance\/health)\/uploads\/([a-z0-9-]+\.(png|jpg))$/;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const CONTENT_TYPES = { png: "image/png", jpg: "image/jpeg" };

// Throws if no one is signed in.
function uploadsDir() {
    return path.join(currentProfileDir(), "uploads");
}

function slugify(name) {
    return (name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}

// An image chosen in a form but not saved yet arrives as a data URL; saved ones are "/uploads/<file>".
export function isPendingUpload(value) {
    return typeof value === "string" && value.startsWith("data:");
}

export function isUpload(value) {
    return UPLOAD_PATH.test(value || "");
}

// Writes a PNG or JPEG data URL to the profile's uploads folder and returns its "/uploads/<file>" path.
// The file type is checked from its contents, not just the data URL's label.
export function saveUpload(name, dataUrl) {
    const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(dataUrl);
    if (!match) throw new Error("Only PNG and JPEG images can be uploaded");

    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > MAX_UPLOAD_BYTES) throw new Error("Image is too large");
    const extension = bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ? "png"
        : bytes.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE) ? "jpg"
        : null;
    if (!extension) throw new Error("Only PNG and JPEG images can be uploaded");

    const file = `${slugify(name) || "logo"}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    fs.mkdirSync(uploadsDir(), { recursive: true });
    fs.writeFileSync(path.join(uploadsDir(), file), bytes);
    return `/uploads/${file}`;
}

// Removes an uploaded image. Anything that isn't one (a built-in logo, an empty value) is left alone.
export function deleteUpload(img) {
    const match = UPLOAD_PATH.exec(img || "");
    if (!match) return;
    fs.rmSync(path.join(uploadsDir(), match[1]), { force: true });
}

// The bytes and content type of the uploaded `file`, or null if there's no such upload.
export function readUpload(file) {
    if (!UPLOAD_FILE.test(file)) return null;
    const filePath = path.join(uploadsDir(), file);
    if (!fs.existsSync(filePath)) return null;
    return { bytes: fs.readFileSync(filePath), contentType: CONTENT_TYPES[path.extname(file).slice(1)] };
}

// Moves an image uploaded before uploads moved to private/ into the profile's uploads folder and returns its new path,
// or "" if `publicPath` isn't one or its file is gone.
export function moveLegacyUpload(publicPath) {
    const match = LEGACY_UPLOAD_PATH.exec(publicPath || "");
    const from = match && path.join(process.cwd(), "public", publicPath);
    if (!match || !fs.existsSync(from)) return "";
    fs.mkdirSync(uploadsDir(), { recursive: true });
    fs.renameSync(from, path.join(uploadsDir(), match[2]));
    return `/uploads/${match[2]}`;
}
