package com.autohub.products.application;

import com.autohub.products.infrastructure.persistence.ProductEntity;
import com.autohub.products.infrastructure.persistence.ProductImageEntity;
import com.autohub.products.infrastructure.persistence.ProductImageJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductReviewEntity;
import com.autohub.products.infrastructure.persistence.ProductReviewJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductSpecRowEntity;
import com.autohub.products.infrastructure.persistence.ProductSpecRowJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductVariantEntity;
import com.autohub.products.infrastructure.persistence.ProductVariantJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

/**
 * Seeds the product catalog with 100 machines (50 cars + 50 bikes) across every category,
 * each with variants, grouped technical specifications, 4 original generated SVG images
 * (stored in the DB, served by the API) and a spread of owner reviews.
 *
 * <p>Generation is DETERMINISTIC (fixed random seed), so Dev/QA/UAT/PROD all receive the
 * identical catalog. Idempotent: runs only when the products table is empty. All brands,
 * models, figures and reviews are original fictional data.
 */
@Component
@Order(30)
public class ProductCatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogSeeder.class);
    private static final String[] IMAGE_LABELS = { "Front quarter", "Side profile", "Rear quarter", "Studio detail" };

    private final ProductJpaRepository products;
    private final ProductVariantJpaRepository variants;
    private final ProductSpecRowJpaRepository specs;
    private final ProductImageJpaRepository images;
    private final ProductReviewJpaRepository reviews;

    private final Random rnd = new Random(20260723L);
    private final Set<String> slugs = new HashSet<>();

    public ProductCatalogSeeder(ProductJpaRepository products, ProductVariantJpaRepository variants,
                                ProductSpecRowJpaRepository specs, ProductImageJpaRepository images,
                                ProductReviewJpaRepository reviews) {
        this.products = products;
        this.variants = variants;
        this.specs = specs;
        this.images = images;
        this.reviews = reviews;
    }

    /* ------------------------------ vocabulary ------------------------------ */
    private static final String[] CAR_BRANDS = { "Aurelion", "Stratos Dynamics", "Novacore", "Vanterra", "Hoshi", "Belmonte", "Kestrel", "Solaris" };
    private static final String[] BIKE_BRANDS = { "Ryujin", "Apex Forge", "Volt Havoc", "Windlance", "Cobalt Cycles", "Meridian" };
    private static final String[] CAR_BASES = { "Sovereign", "Vela", "Aria", "Vector", "Pulse", "Quantum", "Corsa", "Ridgeline", "Solstice", "Veloce", "Nimbus", "Zephyr", "Halcyon", "Vertex", "Polaris", "Summit", "Verano", "Ardent", "Cascade", "Lumen" };
    private static final String[] CAR_SUFFIX = { "", "GT", "RS", "X", "LX", "Prime", "Sport", "Touring", "S", "GTS" };
    private static final String[] BIKE_BASES = { "Katana", "Titan", "Strada", "Nomad", "Blitz", "Shogun", "Vagabond", "Courier", "Metro", "Falcon", "Tempest", "Raptor", "Drifter", "Onyx", "Circuit", "Ranger", "Comet", "Vulcan", "Mirage", "Stryder" };
    private static final int[] BIKE_CC = { 125, 160, 200, 250, 300, 350, 400, 450, 500, 650, 750, 900, 1000, 1100, 1200, 1300 };
    private static final String[] AUTHORS = { "Dhruv S.", "Elena M.", "Kabir A.", "Priya N.", "Tomás R.", "Ayesha K.", "Marcus O.", "Nithya V.", "Rahul D.", "Grace L.", "W. Chen", "Farid H.", "Ines P.", "Zoya F.", "Dan W.", "Hank B.", "Lea T.", "Om P.", "Sana M.", "Vikram J.", "Ida S.", "Neel G.", "Cal R.", "Anu R.", "Jorge V.", "Tara B.", "Mina H.", "Louis K.", "Devika P.", "Yusuf E." };
    private static final String[] COLOR_POOL = { "Midnight Blue", "Ivory Pearl", "Obsidian", "Glacier White", "Crimson", "Storm Grey", "Champagne", "Deep Teal", "Sunburst Amber", "Forest Green", "Titanium", "Cobalt", "Burgundy", "Sand Dune", "Graphite", "Arctic Silver" };

    private static final String[][] REVIEW_SNIPPETS = {
        { "Exceeded every expectation", "Six months in and the %s still makes every drive feel like an occasion. Build quality is superb and running costs are lower than I planned for." },
        { "Solid, sensible, satisfying", "The %s does exactly what the brochure promises. Comfortable over broken roads, frugal on the highway, and the service network has been painless." },
        { "The enthusiast's pick", "Bought the %s after testing four rivals. Nothing else in the class steers this well or feels this planted at speed." },
        { "Great value, minor gripes", "Love the %s overall — punchy performance and a premium cabin feel. Wish the infotainment were snappier and the ride a touch softer." },
        { "Daily duty champion", "One year and 18,000 km with the %s: zero breakdowns, one scheduled service, endless compliments. It simply works." },
        { "Weekend hero", "The %s turns Sunday mornings into events. Character, sound and feedback in a segment that usually plays it safe." },
        { "Family approved", "The %s swallowed our airport runs, school runs and one mountain holiday without complaint. Space and safety sold it; refinement keeps us happy." },
        { "Almost five stars", "Docked half a star because the %s deserves better tyres from the factory. Everything else — drivetrain, seats, economy — is class-leading." },
    };

    /* category templates: price lo/hi, power lo/hi, extra flags */
    private record CarCat(String id, int pLo, int pHi, int hpLo, int hpHi, String[] fuels, int[] seats) { }
    private record BikeCat(String id, int pLo, int pHi, int hpLo, int hpHi, boolean electric) { }

    private static final CarCat[] CAR_CATS = {
        new CarCat("hatchback", 95_000, 240_000, 85, 160, new String[]{ "Petrol", "Petrol", "Hybrid" }, new int[]{ 5 }),
        new CarCat("sedan", 250_000, 620_000, 140, 280, new String[]{ "Petrol", "Diesel", "Hybrid" }, new int[]{ 5 }),
        new CarCat("suv", 300_000, 950_000, 160, 420, new String[]{ "Petrol", "Diesel", "Hybrid" }, new int[]{ 5, 7 }),
        new CarCat("coupe", 800_000, 2_400_000, 380, 700, new String[]{ "Petrol" }, new int[]{ 2, 4 }),
        new CarCat("luxury", 1_200_000, 3_400_000, 450, 800, new String[]{ "Petrol" }, new int[]{ 4, 5 }),
        new CarCat("ev", 260_000, 2_500_000, 200, 1020, new String[]{ "Electric" }, new int[]{ 5, 4 }),
        new CarCat("hybrid", 350_000, 720_000, 180, 300, new String[]{ "Hybrid" }, new int[]{ 5 }),
        new CarCat("offroad", 500_000, 1_250_000, 250, 430, new String[]{ "Diesel", "Petrol" }, new int[]{ 5, 7 }),
        new CarCat("convertible", 700_000, 1_900_000, 300, 520, new String[]{ "Petrol" }, new int[]{ 2, 4 }),
    };
    private static final BikeCat[] BIKE_CATS = {
        new BikeCat("commuter", 26_000, 62_000, 8, 14, false),
        new BikeCat("scooter", 32_000, 85_000, 8, 16, false),
        new BikeCat("caferacer", 70_000, 145_000, 20, 48, false),
        new BikeCat("naked", 90_000, 270_000, 40, 160, false),
        new BikeCat("sports", 60_000, 460_000, 24, 210, false),
        new BikeCat("cruiser", 120_000, 310_000, 45, 100, false),
        new BikeCat("adventure", 100_000, 360_000, 38, 140, false),
        new BikeCat("touring", 140_000, 430_000, 60, 165, false),
        new BikeCat("electric", 45_000, 260_000, 8, 110, true),
    };

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (products.count() > 0) {
            return;
        }
        int made = 0;
        for (int i = 0; i < 50; i++) made += seedCar(i) ? 1 : 0;
        for (int i = 0; i < 50; i++) made += seedBike(i) ? 1 : 0;
        log.info("Seeded product catalog: {} products (cars + bikes) with variants, specs, images and reviews", made);
    }

    /* ------------------------------- cars ---------------------------------- */
    private boolean seedCar(int i) {
        CarCat cat = CAR_CATS[i % CAR_CATS.length];
        String brand = CAR_BRANDS[(i * 3 + i / CAR_CATS.length) % CAR_BRANDS.length];
        String model = uniqueName(CAR_BASES[i % CAR_BASES.length], CAR_SUFFIX[(i / CAR_BASES.length + i) % CAR_SUFFIX.length], brand, true);
        String slug = slugify(brand + " " + model);

        ProductEntity p = new ProductEntity(UUID.randomUUID(), slug, "CAR", brand, model, cat.id());
        boolean ev = cat.fuels()[0].equals("Electric");
        int hp = between(cat.hpLo(), cat.hpHi());
        int price = roundTo(between(cat.pLo(), cat.pHi()), 1000);
        int torque = ev ? (int) (hp * 1.4) : (int) (hp * (1.1 + rnd.nextDouble() * .5));
        int seats = cat.seats()[rnd.nextInt(cat.seats().length)];
        String fuel = cat.fuels()[rnd.nextInt(cat.fuels().length)];
        String mileage = fuel.equals("Electric")
                ? between(380, 640) + " km range"
                : String.format(Locale.ROOT, "%.1f km/l", 8 + rnd.nextDouble() * (fuel.equals("Hybrid") ? 16 : 12));
        String trans = fuel.equals("Electric") ? "1AT" : fuel.equals("Hybrid") ? "eCVT"
                : pick("6MT", "7DCT", "8AT", "9AT", "CVT", "10AT");
        String drive = hp > 380 ? pick("AWD", "RWD") : cat.id().equals("offroad") ? "4WD" : pick("FWD", "FWD", "AWD");

        p.setPrice(BigDecimal.valueOf(price));
        p.setSearches(between(15_000, 348_000));
        p.setFuel(fuel);
        p.setTransmission(trans);
        p.setDrivetrain(drive);
        p.setSeating(seats);
        p.setPower(hp + " hp");
        p.setTorque(torque + " Nm");
        p.setMileage(mileage);
        p.setSafety(hp > 250 || price > 500_000 ? 5 : between(3, 5));
        p.setAdas(price > 380_000 || rnd.nextInt(3) == 0);
        p.setSunroof(price > 300_000 && rnd.nextInt(4) != 0);
        if (fuel.equals("Electric")) p.setChargeTime("10–80% in " + between(19, 42) + " min");
        p.setHue((i * 37) % 360);
        p.setHighlight(carHighlight(cat.id(), hp, mileage, seats));
        p.setTags(joinTags(fuel, hp, price, seats));
        p.setColors(pickColors());
        p.setPros(String.join("|", carPro(cat.id()), fuel.equals("Electric") ? "Near-silent drivetrain" : "Strong resale value", "Well-judged ride quality"));
        p.setCons(String.join("|", hp > 400 ? "Thirsty when pushed" : "Modest highway punch", "Options add up quickly"));

        /* edge cases: one collector car w/o price/images/reviews; a few upcoming */
        boolean edgeNoMedia = (i == 47);
        if (edgeNoMedia) { p.setPrice(null); p.setAvailability("Discontinued"); p.setRating(0); }
        else if (i % 16 == 9) p.setAvailability("Upcoming");

        List<ProductReviewEntity> revs = edgeNoMedia ? List.of() : buildReviews(p.getId(), brand + " " + model, price);
        p.setReviewCount(revs.size());
        p.setRating(revs.isEmpty() ? (edgeNoMedia ? 0 : round1(3.7 + rnd.nextDouble() * 1.1))
                : round1(revs.stream().mapToDouble(ProductReviewEntity::getRating).average().orElse(4.2)));

        products.save(p);
        reviews.saveAll(revs);
        saveVariants(p, price, hp, mileage, fuel);
        saveCarSpecs(p, cat, hp, torque, fuel, trans, drive, seats, mileage);
        if (!edgeNoMedia) saveImages(p, brand + " " + model);
        return true;
    }

    private String carHighlight(String cat, int hp, String mileage, int seats) {
        return switch (cat) {
            case "ev" -> "Long-range electric with " + mileage;
            case "luxury" -> "Hand-finished flagship with " + hp + " hp";
            case "coupe" -> hp + " hp driver's coupe";
            case "suv" -> seats + "-seat family SUV sweet spot";
            case "offroad" -> "Locking diffs and true trail hardware";
            case "hatchback" -> "The everyday hatch that sips fuel";
            case "hybrid" -> "Self-charging hybrid economy champion";
            case "convertible" -> "Open-air touring, four seasons a year";
            default -> "Executive comfort, honest economy";
        };
    }

    private void saveCarSpecs(ProductEntity p, CarCat cat, int hp, int torque, String fuel,
                              String trans, String drive, int seats, String mileage) {
        Map<String, Map<String, String>> g = new LinkedHashMap<>();
        boolean ev = fuel.equals("Electric");
        Map<String, String> perf = new LinkedHashMap<>();
        if (ev) {
            perf.put("Motor", hp > 500 ? "Dual PMSM" : "Single PMSM");
            perf.put("Battery", between(55, 110) + " kWh");
            perf.put("Range (WLTP)", p.getMileage());
            perf.put("DC fast charge", p.getChargeTime());
        } else {
            int cc = Math.max(999, hp * between(9, 12));
            perf.put("Engine", String.format(Locale.ROOT, "%.1fL %s", cc / 1000.0, hp > 350 ? "V8 twin-turbo" : hp > 220 ? "V6 turbo" : "I4 turbo"));
            perf.put("Displacement", cc + " cc");
        }
        perf.put("Power", p.getPower());
        perf.put("Torque", p.getTorque());
        perf.put("0–100 km/h", String.format(Locale.ROOT, "%.1f s", Math.max(2.4, 11.5 - hp / 90.0)));
        perf.put("Transmission", trans);
        perf.put("Drivetrain", drive);
        g.put(ev ? "Powertrain" : "Engine & Performance", perf);

        Map<String, String> dim = new LinkedHashMap<>();
        dim.put("Length", (3_900 + between(0, 1400)) + " mm");
        dim.put("Seating", String.valueOf(seats));
        dim.put("Boot space", between(280, 560) + " L");
        dim.put("Kerb weight", (1_000 + between(50, 1200)) + " kg");
        if (!ev) dim.put("Fuel tank", between(35, 95) + " L");
        g.put("Dimensions & Capacity", dim);

        Map<String, String> comfort = new LinkedHashMap<>();
        comfort.put("Airbags", String.valueOf(between(6, 10)));
        comfort.put("ADAS", Boolean.TRUE.equals(p.getAdas()) ? "L2 highway assist" : "Not available");
        comfort.put("Sunroof", Boolean.TRUE.equals(p.getSunroof()) ? "Panoramic" : "Not available");
        comfort.put("Warranty", between(3, 8) + " yr / " + between(100, 160) + ",000 km");
        g.put("Comfort & Safety", comfort);
        persistSpecs(p.getId(), g);
    }

    /* ------------------------------- bikes --------------------------------- */
    private boolean seedBike(int i) {
        BikeCat cat = BIKE_CATS[i % BIKE_CATS.length];
        String brand = BIKE_BRANDS[(i * 5 + i / BIKE_CATS.length) % BIKE_BRANDS.length];
        int cc = BIKE_CC[between(0, BIKE_CC.length - 1)];
        String model = uniqueName(BIKE_BASES[i % BIKE_BASES.length], cat.electric() ? "E" : String.valueOf(cc), brand, false);
        String slug = slugify(brand + " " + model);

        ProductEntity p = new ProductEntity(UUID.randomUUID(), slug, "BIKE", brand, model, cat.id());
        int hp = between(cat.hpLo(), cat.hpHi());
        int price = roundTo(between(cat.pLo(), cat.pHi()), 500);
        int torque = cat.electric() ? hp * 2 : Math.max(9, (int) (hp * 0.85));
        String mileage = cat.electric() ? between(90, 280) + " km range"
                : between(14, 64) + " km/l";

        p.setPrice(BigDecimal.valueOf(price));
        p.setSearches(between(18_000, 345_000));
        p.setFuel(cat.electric() ? "Electric" : "Petrol");
        p.setTransmission(cat.electric() ? "Automatic" : cat.id().equals("scooter") ? "CVT automatic" : pick("5MT", "6MT", "6MT (quickshifter)"));
        p.setPower(hp + " hp");
        p.setTorque(torque + " Nm");
        p.setMileage(mileage);
        p.setKerb(between(92, 320) + " kg");
        p.setSeatHeight(between(690, 860) + " mm");
        p.setAbsType(hp > 45 ? pick("Dual-channel", "Cornering ABS", "Dual-channel, cornering") : pick("Single-channel", "CBS"));
        p.setCooling(cat.electric() ? "Liquid (battery)" : hp > 30 ? "Liquid" : "Air");
        if (cat.electric()) p.setChargeTime("0–80% in " + between(35, 210) + " min");
        p.setHue((180 + i * 41) % 360);
        p.setHighlight(bikeHighlight(cat.id(), hp, mileage));
        p.setTags(joinTags(p.getFuel(), hp, price, 2));
        p.setColors(pickColors());
        p.setPros(String.join("|", bikePro(cat.id()), hp > 100 ? "Electronics safety net" : "Light and friendly", "Strong dealer network"));
        p.setCons(String.join("|", hp > 150 ? "Committed riding position" : "Windblast at highway pace", "Pillion seat is firm"));

        boolean edgeNoMedia = (i == 43);
        if (edgeNoMedia) { p.setAvailability("Upcoming"); }
        if (i % 19 == 11) p.setAvailability("Upcoming");

        List<ProductReviewEntity> revs = (i % 7 == 3) ? List.of() : buildReviews(p.getId(), brand + " " + model, price);
        p.setReviewCount(revs.size());
        p.setRating(revs.isEmpty() ? round1(3.7 + rnd.nextDouble() * 1.0)
                : round1(revs.stream().mapToDouble(ProductReviewEntity::getRating).average().orElse(4.2)));

        products.save(p);
        reviews.saveAll(revs);
        saveVariants(p, price, hp, mileage, p.getFuel());
        saveBikeSpecs(p, cat, hp, torque, mileage);
        if (!edgeNoMedia) saveImages(p, brand + " " + model);
        return true;
    }

    private String bikeHighlight(String cat, int hp, String mileage) {
        return switch (cat) {
            case "sports" -> hp > 150 ? "Litre-class track weapon with " + hp + " hp" : "Everyone's first full fairing";
            case "cruiser" -> "Low-slung boulevard king";
            case "electric" -> "Instant-torque electric with " + mileage;
            case "adventure" -> "Rally-bred, ready for fire roads";
            case "touring" -> "Continental days without fatigue";
            case "scooter" -> "The city favourite at " + mileage;
            case "commuter" -> mileage + ". That's the headline.";
            case "caferacer" -> "Clip-ons, chrome and coffee";
            default -> "Hooligan-spec street naked";
        };
    }

    private void saveBikeSpecs(ProductEntity p, BikeCat cat, int hp, int torque, String mileage) {
        Map<String, Map<String, String>> g = new LinkedHashMap<>();
        Map<String, String> perf = new LinkedHashMap<>();
        if (cat.electric()) {
            perf.put("Motor", hp > 40 ? "Mid-drive PMSM" : "Hub-mounted BLDC");
            perf.put("Battery", String.format(Locale.ROOT, "%.1f kWh", 2.5 + rnd.nextDouble() * 16));
            perf.put("Range", mileage);
            perf.put("Charge time", p.getChargeTime());
        } else {
            int cc = Math.max(109, hp * between(6, 9));
            perf.put("Engine", cc + "cc " + (hp > 100 ? "inline-4" : hp > 45 ? "parallel-twin" : "single"));
            perf.put("Displacement", cc + " cc");
        }
        perf.put("Power", p.getPower());
        perf.put("Torque", p.getTorque());
        perf.put("Transmission", p.getTransmission());
        perf.put("Cooling", p.getCooling());
        g.put(cat.electric() ? "Powertrain" : "Engine & Performance", perf);

        Map<String, String> chassis = new LinkedHashMap<>();
        chassis.put("Kerb weight", p.getKerb());
        chassis.put("Seat height", p.getSeatHeight());
        chassis.put("Fuel tank", cat.electric() ? "—" : between(5, 25) + " L");
        chassis.put("Ground clearance", between(130, 230) + " mm");
        g.put("Chassis & Dimensions", chassis);

        Map<String, String> brakes = new LinkedHashMap<>();
        brakes.put("ABS", p.getAbsType());
        brakes.put("Front suspension", hp > 60 ? "USD forks, adjustable" : "Telescopic forks");
        brakes.put("Warranty", between(2, 5) + " yr");
        g.put("Braking & Suspension", brakes);
        persistSpecs(p.getId(), g);
    }

    /* ------------------------------ shared bits ----------------------------- */
    private void saveVariants(ProductEntity p, int basePrice, int hp, String mileage, String fuel) {
        String[][] ladders = {
            { "Standard" },
            { "Standard", "Sport" },
            { "Standard", "Sport", "Elite" },
            { "S", "SX" },
            { fuel.equals("Electric") ? "Standard Range" : "Base", fuel.equals("Electric") ? "Long Range" : "GT" },
        };
        String[] ladder = ladders[rnd.nextInt(ladders.length)];
        List<ProductVariantEntity> list = new ArrayList<>();
        for (int i = 0; i < ladder.length; i++) {
            double mult = 1 + i * (0.10 + rnd.nextDouble() * 0.06);
            BigDecimal vp = p.getPrice() == null ? null : BigDecimal.valueOf(roundTo((int) (basePrice * mult), 500));
            String vpow = (int) (hp * (1 + i * 0.06)) + " hp";
            list.add(new ProductVariantEntity(UUID.randomUUID(), p.getId(), ladder[i], vp, vpow, mileage, i));
        }
        variants.saveAll(list);
    }

    private void persistSpecs(UUID productId, Map<String, Map<String, String>> groups) {
        List<ProductSpecRowEntity> rows = new ArrayList<>();
        int pos = 0;
        for (Map.Entry<String, Map<String, String>> gr : groups.entrySet()) {
            for (Map.Entry<String, String> kv : gr.getValue().entrySet()) {
                rows.add(new ProductSpecRowEntity(UUID.randomUUID(), productId, gr.getKey(), kv.getKey(), kv.getValue(), pos++));
            }
        }
        specs.saveAll(rows);
    }

    private void saveImages(ProductEntity p, String brandModel) {
        List<ProductImageEntity> list = new ArrayList<>();
        for (int a = 0; a < IMAGE_LABELS.length; a++) {
            String svg = ProductSvgArt.render(p.getType(), p.getHue(), a, IMAGE_LABELS[a], brandModel);
            list.add(new ProductImageEntity(UUID.randomUUID(), p.getId(), a, IMAGE_LABELS[a], svg));
        }
        images.saveAll(list);
    }

    private List<ProductReviewEntity> buildReviews(UUID productId, String brandModel, int price) {
        int count = rnd.nextInt(5);           /* 0..4 */
        List<ProductReviewEntity> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String[] snippet = REVIEW_SNIPPETS[rnd.nextInt(REVIEW_SNIPPETS.length)];
            double rating = Math.min(5, Math.max(3, round1(3.5 + rnd.nextDouble() * 1.5)));
            boolean verified = rnd.nextInt(5) != 0;
            list.add(new ProductReviewEntity(
                    UUID.randomUUID(), productId, AUTHORS[rnd.nextInt(AUTHORS.length)], rating,
                    snippet[0], String.format(snippet[1], brandModel),
                    String.format(Locale.ROOT, "2026-%02d-%02d", between(1, 6), between(1, 28)),
                    verified, verified ? "Owner" : "Test ride",
                    null, null, null, between(3, 70), i));
        }
        return list;
    }

    private String carPro(String cat) {
        return switch (cat) {
            case "ev" -> "Real-world range holds up";
            case "luxury" -> "Cathedral-quiet cabin";
            case "coupe" -> "Scalpel steering";
            case "suv" -> "Space for the whole crew";
            case "offroad" -> "Goes genuinely anywhere";
            case "hatchback" -> "Sips fuel, easy to park";
            case "hybrid" -> "Diesel-beating economy";
            case "convertible" -> "Open-air grand touring";
            default -> "Comfort-first tuning";
        };
    }

    private String bikePro(String cat) {
        return switch (cat) {
            case "sports" -> "Track-honed chassis";
            case "cruiser" -> "Armchair seat height";
            case "electric" -> "Instant torque off the line";
            case "adventure" -> "Genuine off-road chops";
            case "touring" -> "All-day comfort";
            case "scooter" -> "Fits a full-face lid under the seat";
            case "commuter" -> "Cheapest possible commutes";
            case "caferacer" -> "Timeless looks";
            default -> "Torque everywhere";
        };
    }

    private String joinTags(String fuel, int hp, int price, int seats) {
        List<String> tags = new ArrayList<>();
        if (fuel.equals("Electric")) tags.add("EV Ready");
        if (hp >= 200) tags.add("Track Inspired");
        if (hp >= 300 || (hp >= 60 && hp < 200 && price > 150_000)) tags.add("Torque Focused");
        if (price < 300_000 && seats <= 5) tags.add("City Agile");
        return String.join("|", tags.stream().limit(2).toList());
    }

    private String pickColors() {
        int n = between(2, 4);
        List<String> chosen = new ArrayList<>();
        while (chosen.size() < n) {
            String c = COLOR_POOL[rnd.nextInt(COLOR_POOL.length)];
            if (!chosen.contains(c)) chosen.add(c);
        }
        return String.join("|", chosen);
    }

    private String uniqueName(String base, String suffix, String brand, boolean car) {
        String name = suffix.isEmpty() ? base : base + " " + suffix;
        String slug = slugify(brand + " " + name);
        int bump = 2;
        while (slugs.contains(slug)) {
            name = base + " " + suffix + (car ? " " + romal(bump) : "-" + bump);
            slug = slugify(brand + " " + name);
            bump++;
        }
        slugs.add(slug);
        return name.trim();
    }

    private static String romal(int n) { return switch (n) { case 2 -> "II"; case 3 -> "III"; case 4 -> "IV"; default -> "V" + n; }; }

    private static String slugify(String s) {
        return s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private int between(int lo, int hi) { return lo + rnd.nextInt(Math.max(1, hi - lo + 1)); }
    private int roundTo(int v, int step) { return (v / step) * step; }
    private double round1(double d) { return Math.round(d * 10) / 10.0; }
    private String pick(String... options) { return options[rnd.nextInt(options.length)]; }
}
