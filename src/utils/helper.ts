import { networkInterfaces } from "os";
import { Request } from "express";
import requestIp from "request-ip";

export const getLocalIp = (): string => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
};

export const formatMB = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export const getMemory = () =>
  Object.fromEntries(
    Object.entries(process.memoryUsage()).map(([k, v]) => [k, formatMB(v)]),
  );

export const getUptime = () => {
  const seconds = Math.floor(process.uptime());
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h.toString().padStart(2, "0")}H:${m
    .toString()
    .padStart(2, "0")}M:${s.toString().padStart(2, "0")}S`;
};

export const norm = (color?: string, def: string = "&H00000000") => {
  if (!color) return def;
  const clean = color.replace("&H", "");
  const formatted = clean.length === 6 ? "00" + clean : clean;
  return `&H${formatted.toUpperCase()}`;
};

export const getUserIp = (req: Request): string => {
  const clientIp = requestIp.getClientIp(req) ?? "Unknown";
  const cleanedClient = clientIp.replace("::ffff:", "");
  return cleanedClient;
};

export const NOT_ALLOWED_IP = [
  // IPv4 loopback
  "127.0.0.1",
  "127.0.0.2",

  // IPv6 loopback
  "::1",
  "::ffff:127.0.0.1",

  // Localhost hostname
  "localhost",

  // Private/internal network ranges (common in cloud/docker environments)
  "10.0.0.1",
  "192.168.0.1",
  "192.168.1.1",
  "172.16.0.1",

  // Unknown/unresolved
  "unknown",
  "undefined",
  "",
];
