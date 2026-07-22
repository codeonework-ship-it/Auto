package com.autohub.products.application;

/**
 * Generates the original vector artwork for catalog products: a stylized gradient
 * silhouette (car or bike) on a studio background with a blueprint ground-line.
 * Entirely procedural — no external or copyrighted assets — so every image is
 * an original work, a few KB in size, and instant to serve.
 */
public final class ProductSvgArt {

    private ProductSvgArt() { }

    public static String render(String type, int hue, int angle, String label, String brandModel) {
        int h = Math.floorMod(hue + angle * 26, 360);
        String gid = "g" + h + "a" + angle;
        String g1 = "hsl(" + h + " 72% 52%)";
        String g2 = "hsl(" + ((h + 45) % 360) + " 78% 40%)";
        String body = "CAR".equalsIgnoreCase(type) ? carBody(gid, h) : bikeBody(gid);
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 360\" width=\"640\" height=\"360\" role=\"img\" aria-label=\""
                + escape(brandModel) + " — " + escape(label) + "\">"
                + "<defs><linearGradient id=\"" + gid + "\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
                + "<stop offset=\"0\" stop-color=\"" + g1 + "\"/><stop offset=\"1\" stop-color=\"" + g2 + "\"/></linearGradient>"
                + "<linearGradient id=\"bg" + gid + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">"
                + "<stop offset=\"0\" stop-color=\"hsl(" + h + " 28% 14%)\"/><stop offset=\"1\" stop-color=\"hsl(" + h + " 32% 8%)\"/></linearGradient></defs>"
                + "<rect width=\"640\" height=\"360\" fill=\"url(#bg" + gid + ")\"/>"
                + "<path d=\"M0 296 H640\" stroke=\"hsl(" + h + " 45% 48% / .55)\" stroke-width=\"3\"/>"
                + "<path d=\"M40 320 H600 M80 338 H560\" stroke=\"hsl(" + h + " 35% 35% / .35)\" stroke-width=\"1.5\"/>"
                + "<ellipse cx=\"330\" cy=\"300\" rx=\"280\" ry=\"16\" fill=\"rgba(0,0,0,.35)\"/>"
                + "<g transform=\"translate(0 40) scale(2)\">" + body + "</g>"
                + "<text x=\"24\" y=\"340\" font-family=\"Segoe UI, Arial, sans-serif\" font-size=\"18\" fill=\"hsl("
                + h + " 30% 78%)\" opacity=\".9\">" + escape(label) + "</text></svg>";
    }

    private static String carBody(String gid, int h) {
        return "<path d=\"M28 118 C40 96 62 90 88 86 L114 64 C152 47 208 47 242 66 L272 86 C292 92 300 101 302 113 L302 126 L282 128 A26 26 0 0 0 232 130 L124 130 A26 26 0 0 0 72 132 L30 128 Z\" fill=\"url(#" + gid + ")\"/>"
                + "<path d=\"M122 66 L152 53 C182 45 210 47 231 62 L245 80 L124 82 Z\" fill=\"rgba(240,246,255,.82)\"/>"
                + "<circle cx=\"98\" cy=\"130\" r=\"21\" fill=\"#141a26\"/><circle cx=\"98\" cy=\"130\" r=\"9\" fill=\"#8d97a8\"/>"
                + "<circle cx=\"258\" cy=\"130\" r=\"21\" fill=\"#141a26\"/><circle cx=\"258\" cy=\"130\" r=\"9\" fill=\"#8d97a8\"/>"
                + "<rect x=\"286\" y=\"98\" width=\"12\" height=\"5\" rx=\"2\" fill=\"hsl(" + h + " 80% 72%)\"/>";
    }

    private static String bikeBody(String gid) {
        return "<circle cx=\"82\" cy=\"122\" r=\"34\" fill=\"none\" stroke=\"#141a26\" stroke-width=\"11\"/>"
                + "<circle cx=\"82\" cy=\"122\" r=\"10\" fill=\"#8d97a8\"/>"
                + "<circle cx=\"244\" cy=\"122\" r=\"34\" fill=\"none\" stroke=\"#141a26\" stroke-width=\"11\"/>"
                + "<circle cx=\"244\" cy=\"122\" r=\"10\" fill=\"#8d97a8\"/>"
                + "<path d=\"M82 122 L146 96 L196 100 L214 70 L232 62\" fill=\"none\" stroke=\"url(#" + gid + ")\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
                + "<path d=\"M244 122 L214 70\" fill=\"none\" stroke=\"#3c4657\" stroke-width=\"8\" stroke-linecap=\"round\"/>"
                + "<path d=\"M124 92 L188 80 L198 100 L150 106 Z\" fill=\"url(#" + gid + ")\"/>"
                + "<path d=\"M204 63 L232 52\" stroke=\"#3c4657\" stroke-width=\"7\" stroke-linecap=\"round\"/>"
                + "<path d=\"M96 96 L134 90\" stroke=\"#232b3a\" stroke-width=\"10\" stroke-linecap=\"round\"/>";
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
