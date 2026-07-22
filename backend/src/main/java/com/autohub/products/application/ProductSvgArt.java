package com.autohub.products.application;

/**
 * Cinematic studio renders for catalog products — original, procedural vector art.
 * Dark hangar scene, angular machine silhouette with metallic paint gradient,
 * neon rim-light and underglow, precision grid floor and HUD framing. Four angles
 * are produced per product (front quarter / side / rear / detail crop) by mirroring
 * and reframing the same scene. No external or franchise assets — all paths original.
 */
public final class ProductSvgArt {

    private ProductSvgArt() { }

    public static String render(String type, int hue, int angle, String label, String brandModel) {
        boolean car = "CAR".equalsIgnoreCase(type);
        int h = Math.floorMod(hue, 360);
        String paint1 = "hsl(" + h + " 42% 46%)";
        String paint2 = "hsl(" + h + " 55% 22%)";
        String paintHi = "hsl(" + h + " 60% 64%)";
        String cyan = "#35e0ff";
        String uid = "u" + h + "a" + angle + (car ? "c" : "b");

        /* per-angle staging: mirror for rear view, zoom for the detail crop */
        String stage = switch (angle) {
            case 2 -> "translate(640 0) scale(-1 1)";                    /* rear quarter (mirrored) */
            case 3 -> "translate(-260 -140) scale(1.8)";                 /* detail crop */
            case 1 -> "translate(12 0)";                                 /* side profile */
            default -> "";                                               /* front quarter */
        };

        String vehicle = car ? carScene(uid, paintHi) : bikeScene(uid, paintHi);

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 360\" width=\"640\" height=\"360\" role=\"img\" aria-label=\""
            + esc(brandModel) + " — " + esc(label) + "\">"
            + "<defs>"
            + "<linearGradient id=\"p" + uid + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">"
            + "<stop offset=\"0\" stop-color=\"" + paint1 + "\"/><stop offset=\"1\" stop-color=\"" + paint2 + "\"/></linearGradient>"
            + "<radialGradient id=\"v" + uid + "\" cx=\".5\" cy=\".28\" r=\".85\">"
            + "<stop offset=\"0\" stop-color=\"#111a28\"/><stop offset=\".6\" stop-color=\"#0a0f18\"/><stop offset=\"1\" stop-color=\"#05070c\"/></radialGradient>"
            + "<linearGradient id=\"fl" + uid + "\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\">"
            + "<stop offset=\"0\" stop-color=\"" + cyan + "\" stop-opacity=\"0\"/><stop offset=\".5\" stop-color=\"" + cyan + "\" stop-opacity=\".65\"/>"
            + "<stop offset=\"1\" stop-color=\"" + cyan + "\" stop-opacity=\"0\"/></linearGradient>"
            + "<filter id=\"g" + uid + "\" x=\"-40%\" y=\"-40%\" width=\"180%\" height=\"180%\">"
            + "<feGaussianBlur stdDeviation=\"7\"/></filter>"
            + "</defs>"
            /* backdrop + perspective grid */
            + "<rect width=\"640\" height=\"360\" fill=\"url(#v" + uid + ")\"/>"
            + gridFloor(cyan)
            /* neon horizon */
            + "<rect x=\"0\" y=\"263\" width=\"640\" height=\"2\" fill=\"url(#fl" + uid + ")\"/>"
            /* the machine */
            + "<g transform=\"" + stage + "\">"
            + "<ellipse cx=\"320\" cy=\"278\" rx=\"238\" ry=\"12\" fill=\"" + cyan + "\" opacity=\".18\" filter=\"url(#g" + uid + ")\"/>"
            + "<ellipse cx=\"320\" cy=\"276\" rx=\"250\" ry=\"9\" fill=\"#000\" opacity=\".55\"/>"
            + vehicle
            + "</g>"
            /* HUD frame + designation */
            + "<path d=\"M14 14 h30 M14 14 v30 M626 14 h-30 M626 14 v30 M14 346 h30 M14 346 v-30 M626 346 h-30 M626 346 v-30\""
            + " stroke=\"" + cyan + "\" stroke-opacity=\".55\" stroke-width=\"2\" fill=\"none\"/>"
            + "<text x=\"26\" y=\"38\" font-family=\"Consolas,Menlo,monospace\" font-size=\"13\" letter-spacing=\"2\" fill=\"" + cyan + "\" opacity=\".85\">"
            + esc(label.toUpperCase()) + "</text>"
            + "<text x=\"26\" y=\"338\" font-family=\"Consolas,Menlo,monospace\" font-size=\"11\" letter-spacing=\"1\" fill=\"#7d8fa5\">"
            + esc(brandModel.toUpperCase()) + " // MACHINA STUDIO</text>"
            + "</svg>";
    }

    private static String gridFloor(String cyan) {
        StringBuilder sb = new StringBuilder("<g stroke=\"" + cyan + "\" stroke-opacity=\".07\" stroke-width=\"1\">");
        for (int x = 0; x <= 640; x += 64) {           /* converging verticals */
            int top = 320 + (x - 320) / 3;
            sb.append("<path d=\"M").append(top).append(" 264 L").append(x).append(" 360\"/>");
        }
        for (int y = 276; y <= 356; y += 22) {          /* horizontals, denser near horizon */
            sb.append("<path d=\"M0 ").append(y).append(" H640\"/>");
        }
        return sb.append("</g>").toString();
    }

    /* ------------------------- angular hypercar scene ------------------------- */
    private static String carScene(String uid, String paintHi) {
        String cyan = "#35e0ff";
        return
            /* low wedge body */
            "<path d=\"M64 268 L74 240 L106 226 L164 218 L206 190 Q286 164 366 170 L446 182 Q520 194 558 226 L580 254 L576 268 Z\" fill=\"url(#p" + uid + ")\"/>"
            /* roofline rim-light */
            + "<path d=\"M106 226 L164 218 L206 190 Q286 164 366 170 L446 182 Q520 194 558 226\" fill=\"none\" stroke=\"" + paintHi + "\" stroke-width=\"2.4\" opacity=\".9\"/>"
            + "<path d=\"M206 190 Q286 164 366 170 L446 182\" fill=\"none\" stroke=\"" + cyan + "\" stroke-width=\"1.6\" opacity=\".8\" filter=\"url(#g" + uid + ")\"/>"
            /* canopy */
            + "<path d=\"M216 192 L262 172 Q318 162 364 170 L404 178 L382 196 L238 200 Z\" fill=\"#0b1420\" stroke=\"#3a4f66\" stroke-width=\"1.4\"/>"
            + "<path d=\"M222 191 L262 174 Q316 164 362 172\" stroke=\"#9fd8ea\" stroke-opacity=\".55\" stroke-width=\"2\" fill=\"none\"/>"
            /* side intake + skirt lines */
            + "<path d=\"M330 226 L420 220 L446 236 L340 240 Z\" fill=\"#05070c\" opacity=\".75\"/>"
            + "<path d=\"M96 246 L560 246\" stroke=\"#05070c\" stroke-width=\"3\" opacity=\".5\"/>"
            /* headlight blade (front, right) + tail blade (left) */
            + "<path d=\"M556 226 L580 250 L566 252 L544 232 Z\" fill=\"" + cyan + "\" opacity=\".9\" filter=\"url(#g" + uid + ")\"/>"
            + "<path d=\"M66 246 L84 238 L86 248 L70 254 Z\" fill=\"#ff4b4b\" opacity=\".85\" filter=\"url(#g" + uid + ")\"/>"
            /* rear wing */
            + "<path d=\"M58 224 L44 208 L118 206 L112 218 Z\" fill=\"#0d1420\" stroke=\"#31465c\" stroke-width=\"1.5\"/>"
            /* wheels: deep tire + lit rim + spokes */
            + wheel(178, 262, uid) + wheel(474, 262, uid);
    }

    private static String wheel(int cx, int cy, String uid) {
        String cyan = "#35e0ff";
        StringBuilder spokes = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            double a = Math.PI * 2 * i / 5 - Math.PI / 2;
            long x2 = Math.round(cx + Math.cos(a) * 21);
            long y2 = Math.round(cy + Math.sin(a) * 21);
            spokes.append("<path d=\"M").append(cx).append(" ").append(cy).append(" L").append(x2).append(" ").append(y2)
                  .append("\" stroke=\"#5c6c80\" stroke-width=\"3.5\"/>");
        }
        return "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"40\" fill=\"#05070b\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"40\" fill=\"none\" stroke=\"#161d29\" stroke-width=\"7\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"26\" fill=\"none\" stroke=\"" + cyan + "\" stroke-width=\"2\" opacity=\".85\" filter=\"url(#g" + uid + ")\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"24\" fill=\"#0a0f16\"/>" + spokes
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"5\" fill=\"#8b9bb0\"/>";
    }

    /* ------------------------- angular sportbike scene ------------------------ */
    private static String bikeScene(String uid, String paintHi) {
        String cyan = "#35e0ff";
        return
            /* rear wheel + front wheel */
            bikeWheel(168, 252, uid) + bikeWheel(462, 252, uid)
            /* swingarm + frame spar */
            + "<path d=\"M168 252 L286 216 L332 208\" stroke=\"#2a3648\" stroke-width=\"11\" stroke-linecap=\"round\" fill=\"none\"/>"
            /* front fork */
            + "<path d=\"M462 252 L408 138\" stroke=\"#3a4a5f\" stroke-width=\"9\" stroke-linecap=\"round\"/>"
            + "<path d=\"M470 252 L418 140\" stroke=\"#212c3b\" stroke-width=\"5\" stroke-linecap=\"round\"/>"
            /* fairing wedge */
            + "<path d=\"M252 150 L356 122 L432 142 L410 196 L302 210 Z\" fill=\"url(#p" + uid + ")\"/>"
            + "<path d=\"M252 150 L356 122 L432 142\" stroke=\"" + paintHi + "\" stroke-width=\"2.4\" fill=\"none\" opacity=\".95\"/>"
            + "<path d=\"M356 122 L432 142\" stroke=\"" + cyan + "\" stroke-width=\"1.6\" opacity=\".8\" filter=\"url(#g" + uid + ")\"/>"
            /* tank + tail up-kick */
            + "<path d=\"M196 176 L286 148 L318 168 L232 196 Z\" fill=\"url(#p" + uid + ")\"/>"
            + "<path d=\"M196 176 L146 148 L226 152 Z\" fill=\"#0d1420\" stroke=\"#31465c\" stroke-width=\"1.5\"/>"
            /* screen + headlight blade */
            + "<path d=\"M404 128 L436 118 L444 132 L418 140 Z\" fill=\"#0b1420\" stroke=\"#3a4f66\" stroke-width=\"1.2\"/>"
            + "<path d=\"M430 142 L452 150 L440 158 L424 150 Z\" fill=\"" + cyan + "\" opacity=\".9\" filter=\"url(#g" + uid + ")\"/>"
            /* exhaust */
            + "<path d=\"M210 214 L306 226 L300 238 L214 228 Z\" fill=\"#1a2330\" stroke=\"#39485c\" stroke-width=\"1.4\"/>"
            /* tail light */
            + "<path d=\"M148 150 L136 144 L142 154 Z\" fill=\"#ff4b4b\" opacity=\".9\" filter=\"url(#g" + uid + ")\"/>";
    }

    private static String bikeWheel(int cx, int cy, String uid) {
        String cyan = "#35e0ff";
        return "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"46\" fill=\"none\" stroke=\"#05070b\" stroke-width=\"17\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"46\" fill=\"none\" stroke=\"#161d29\" stroke-width=\"9\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"33\" fill=\"none\" stroke=\"" + cyan + "\" stroke-width=\"2\" opacity=\".85\" filter=\"url(#g" + uid + ")\"/>"
             + "<circle cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"6\" fill=\"#8b9bb0\"/>"
             + "<path d=\"M" + (cx - 30) + " " + cy + " H" + (cx + 30) + " M" + cx + " " + (cy - 30) + " V" + (cy + 30) + "\" stroke=\"#46556a\" stroke-width=\"3\"/>";
    }

    private static String esc(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
