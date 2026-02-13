// Expanded Dummy Products Database with Live Unsplash Image Keywords
const productsData = {
  Electronics: [
    {
      id: 1,
      name: "Smart TV 55 inch",
      price: 35000,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=500",
      description:
        "55-inch 4K UHD Smart TV with HDR support, built-in streaming apps, and voice control. Perfect for home entertainment with crystal-clear picture quality.",
    },
    {
      id: 2,
      name: "Samsung Galaxy S23",
      price: 45000,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=500",
      description:
        "Latest Samsung flagship smartphone with advanced camera system, fast charging, and premium build quality. Features 120Hz display and powerful performance.",
    },
    {
      id: 3,
      name: "Wireless Earbuds Pro",
      price: 8990,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500",
      description:
        "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
    },
    {
      id: 4,
      name: "Laptop Dell XPS 13",
      price: 89999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=500",
      description:
        "Ultra-portable laptop with Intel i7 processor, 16GB RAM, 512GB SSD, and stunning InfinityEdge display. Ideal for professionals and students.",
    },
    {
      id: 5,
      name: 'iPad Pro 12.9"',
      price: 79999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500",
      description:
        "12.9-inch iPad Pro with M2 chip, Liquid Retina XDR display, and Apple Pencil compatibility. Perfect for creative professionals and digital artists.",
    },
    {
      id: 6,
      name: "PlayStation 5",
      price: 49999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=500",
      description:
        "Next-generation gaming console with ultra-high-speed SSD, Ray Tracing, and 4K gaming capabilities. Includes DualSense controller for immersive gameplay.",
    },
    {
      id: 7,
      name: "4K Webcam",
      price: 3499,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1623949950762-cb613b56a146?q=80&w=500",
      description:
        "Professional 4K webcam with auto-focus, low-light correction, and built-in microphone. Perfect for streaming, video calls, and content creation.",
    },
    {
      id: 8,
      name: "Portable SSD 1TB",
      price: 4999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1628157796440-279532856da0?q=80&w=500",
      description:
        "Fast and reliable 1TB portable SSD with USB 3.2 interface. Compact design, shock-resistant, and perfect for data backup and transfer.",
    },
    {
      id: 9,
      name: "Smart Watch Series 8",
      price: 29999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=500",
      description:
        "Advanced smartwatch with health monitoring, GPS, cellular connectivity, and long battery life. Track fitness, receive notifications, and stay connected.",
    },
    {
      id: 10,
      name: "Mechanical Keyboard RGB",
      price: 3999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=500",
      description:
        "Premium mechanical keyboard with RGB backlighting, tactile switches, and aluminum frame. Perfect for gaming and professional typing.",
    },
    {
      id: 11,
      name: "Wireless Mouse",
      price: 1299,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=500",
      description:
        "Ergonomic wireless mouse with precision tracking, long battery life, and comfortable design. Perfect for office work and everyday computing.",
    },
    {
      id: 12,
      name: "Monitor 27 inch 144Hz",
      price: 22000,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1527435330379-827dd6fa6911?q=80&w=500",
      description:
        "27-inch gaming monitor with 144Hz refresh rate, 1ms response time, and QHD resolution. Ideal for gaming and professional work.",
    },
    {
      id: 13,
      name: "Power Bank 20000mAh",
      price: 2499,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=500",
      description:
        "High-capacity 20000mAh power bank with fast charging support and multiple USB ports. Keep your devices charged on the go.",
    },
    {
      id: 14,
      name: "USB-C Hub 7-in-1",
      price: 2999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=500",
      description:
        "Versatile USB-C hub with 7 ports including HDMI, USB-A, SD card slots, and Ethernet. Expand your laptop's connectivity options.",
    },
    {
      id: 15,
      name: "HDMI Cable 2M",
      price: 349,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1599818818826-628d087b320d?q=80&w=500",
      description:
        "High-quality 2-meter HDMI cable supporting 4K resolution and HDR. Perfect for connecting displays and gaming consoles.",
    },
    {
      id: 16,
      name: "Laptop Stand",
      price: 1599,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1616428751579-22cb7c772cb6?q=80&w=500",
      description:
        "Adjustable laptop stand with ergonomic design and cooling vents. Improve your posture and device performance while working.",
    },
    {
      id: 17,
      name: "Monitor Light Bar",
      price: 2199,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=500",
      description:
        "LED light bar for monitors with adjustable brightness and color temperature. Reduce eye strain during long work sessions.",
    },
    {
      id: 18,
      name: "Cooling Pad Laptop",
      price: 1499,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1596408226922-385002fe5283?q=80&w=500",
      description:
        "Laptop cooling pad with multiple fans and adjustable height. Keep your laptop cool during intensive tasks and extend its lifespan.",
    },
    {
      id: 19,
      name: "Cable Organizer Set",
      price: 499,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1621535942485-61c28c823020?q=80&w=500",
      description:
        "Complete cable management set with organizers, ties, and clips. Keep your workspace tidy and organized.",
    },
    {
      id: 20,
      name: "Router WiFi 6",
      price: 5999,
      category: "Electronics",
      image:
        "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=500",
      description:
        "Next-generation WiFi 6 router with fast speeds, wide coverage, and multiple device support. Perfect for modern smart homes.",
    },
  ],
  Clothes: [
    {
      id: 101,
      name: "Casual Cotton T-shirt",
      price: 399,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500",
      description:
        "Comfortable 100% cotton t-shirt with a relaxed fit. Perfect for everyday wear and casual outings.",
    },
    {
      id: 102,
      name: "Formal Blazer Black",
      price: 2499,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500",
      description:
        "Elegant black formal blazer made from premium wool blend. Ideal for office wear and formal occasions.",
    },
    {
      id: 103,
      name: "Blue Jeans Slim Fit",
      price: 1299,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500",
      description:
        "Classic blue slim-fit jeans with stretch fabric for comfort. Versatile style that goes with any outfit.",
    },
    {
      id: 104,
      name: "Summer Dress Floral",
      price: 1599,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1572804013307-a9a111dc824d?q=80&w=500",
    },
    {
      id: 105,
      name: "Polo Shirt",
      price: 799,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=500",
    },
    {
      id: 106,
      name: "Winter Jacket Brown",
      price: 3999,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500",
    },
    {
      id: 107,
      name: "Cargo Pants",
      price: 1899,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=500",
    },
    {
      id: 108,
      name: "Sweater Knit",
      price: 1599,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=500",
    },
    {
      id: 109,
      name: "Athletic Shorts",
      price: 699,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=500",
    },
    {
      id: 110,
      name: "Hoodie Sweatshirt",
      price: 1299,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500",
    },
    {
      id: 111,
      name: "Linen Shirt",
      price: 1199,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1598961942613-ba897716405b?q=80&w=500",
    },
    {
      id: 112,
      name: "Skirt Midi",
      price: 1699,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1583496661160-fb48862c4a4e?q=80&w=500",
    },
    {
      id: 113,
      name: "Shorts Denim",
      price: 999,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=500",
    },
    {
      id: 114,
      name: "Vest Formal",
      price: 1999,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?q=80&w=500",
    },
    {
      id: 115,
      name: "Shirt Checkered",
      price: 899,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1604644401890-0bd678c83788?q=80&w=500",
    },
    {
      id: 116,
      name: "Leggings",
      price: 599,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=500",
    },
    {
      id: 117,
      name: "Underarmour Sports Shirt",
      price: 1499,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=500",
    },
    {
      id: 118,
      name: "Trench Coat",
      price: 4999,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500",
    },
    {
      id: 119,
      name: "Khaki Pants",
      price: 1299,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=500",
    },
    {
      id: 120,
      name: "Crop Top",
      price: 699,
      category: "Clothes",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500",
    },
  ],
  Books: [
    {
      id: 201,
      name: "Think Like a Monk",
      price: 299,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=500",
    },
    {
      id: 202,
      name: "Sapiens",
      price: 399,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=500",
    },
    {
      id: 203,
      name: "Atomic Habits",
      price: 349,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=500",
    },
    {
      id: 204,
      name: "The Selfish Gene",
      price: 279,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=500",
    },
    {
      id: 205,
      name: "1984",
      price: 299,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=500",
    },
    {
      id: 206,
      name: "To Kill a Mockingbird",
      price: 289,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1543004218-ee1417272840?q=80&w=500",
    },
    {
      id: 207,
      name: "The Great Gatsby",
      price: 269,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?q=80&w=500",
    },
    {
      id: 208,
      name: "Pride and Prejudice",
      price: 279,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=500",
    },
    {
      id: 209,
      name: "Educated",
      price: 389,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=500",
    },
    {
      id: 210,
      name: "The Midnight Library",
      price: 319,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1512588149628-9003bd0850b5?q=80&w=500",
    },
    {
      id: 211,
      name: "Becoming",
      price: 359,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=500",
    },
    {
      id: 212,
      name: "Sherlock Holmes",
      price: 249,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1587876947033-5c5040d6ca50?q=80&w=500",
    },
    {
      id: 213,
      name: "The Hobbit",
      price: 329,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=500",
    },
    {
      id: 214,
      name: "Dune",
      price: 399,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1618519764620-7403abdb0971?q=80&w=500",
    },
    {
      id: 215,
      name: "Pet Sematary",
      price: 349,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=500",
    },
    {
      id: 216,
      name: "The Girl on the Train",
      price: 299,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=500",
    },
    {
      id: 217,
      name: "Steelyard Blues",
      price: 259,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=500",
    },
    {
      id: 218,
      name: "A Thousand Years of Good Prayers",
      price: 289,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=500",
    },
    {
      id: 219,
      name: "Your Name",
      price: 279,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=500",
    },
    {
      id: 220,
      name: "Coraline",
      price: 319,
      category: "Books",
      image:
        "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?q=80&w=500",
    },
  ],
  "Home & Garden": [
    {
      id: 301,
      name: "Coffee Maker",
      price: 1999,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1520970014086-2208ef4f15d9?q=80&w=500",
    },
    {
      id: 302,
      name: "Microwave Oven",
      price: 4999,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?q=80&w=500",
    },
    {
      id: 303,
      name: "Air Fryer",
      price: 3999,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=500",
    },
    {
      id: 304,
      name: "Blender Mixer",
      price: 1299,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=500",
    },
    {
      id: 305,
      name: "Vacuum Cleaner",
      price: 7999,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=500",
    },
    {
      id: 306,
      name: "Bed Sheet Set",
      price: 899,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=500",
    },
    {
      id: 307,
      name: "Pillow Set",
      price: 1299,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=500",
    },
    {
      id: 308,
      name: "Garden Tool Set",
      price: 1599,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500",
    },
    {
      id: 309,
      name: "Plant Pot Set",
      price: 599,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=500",
    },
    {
      id: 310,
      name: "Desk Lamp",
      price: 799,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=500",
    },
    {
      id: 311,
      name: "Curtain Rod",
      price: 499,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500",
    },
    {
      id: 312,
      name: "Curtains",
      price: 1299,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500",
    },
    {
      id: 313,
      name: "Kettle Electric",
      price: 899,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=500",
    },
    {
      id: 314,
      name: "Toaster",
      price: 1199,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1520608003405-594248af9082?q=80&w=500",
    },
    {
      id: 315,
      name: "Washing Machine",
      price: 19999,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1610557892470-55d9e80e0bce?q=80&w=500",
    },
    {
      id: 316,
      name: "Door Mat",
      price: 299,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500",
    },
    {
      id: 317,
      name: "Towel Set",
      price: 649,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=500",
    },
    {
      id: 318,
      name: "Shower Curtain",
      price: 399,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=500",
    },
    {
      id: 319,
      name: "Mirror Wall",
      price: 1499,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=500",
    },
    {
      id: 320,
      name: "Garden Hose",
      price: 799,
      category: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500",
    },
  ],
  Sports: [
    {
      id: 401,
      name: "Yoga Mat",
      price: 999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=500",
    },
    {
      id: 402,
      name: "Dumbbells Set",
      price: 2999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500",
    },
    {
      id: 403,
      name: "Resistance Bands",
      price: 599,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1598289431512-b97b0917a63a?q=80&w=500",
    },
    {
      id: 404,
      name: "Treadmill",
      price: 19999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=500",
    },
    {
      id: 405,
      name: "Fitness Bike",
      price: 9999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500",
    },
    {
      id: 406,
      name: "Football",
      price: 599,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1552318985-71528b5f59c6?q=80&w=500",
    },
    {
      id: 407,
      name: "Cricket Bat",
      price: 1299,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=500",
    },
    {
      id: 408,
      name: "Tennis Racket",
      price: 2499,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1617083270714-67ad3b1514c6?q=80&w=500",
    },
    {
      id: 409,
      name: "Badminton Set",
      price: 899,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1626225453051-70031855e9ba?q=80&w=500",
    },
    {
      id: 410,
      name: "Skateboard",
      price: 1999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1520156584202-710486666731?q=80&w=500",
    },
    {
      id: 411,
      name: "Roller Skates",
      price: 1399,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=500",
    },
    {
      id: 412,
      name: "Bicycle Mountain",
      price: 7999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=500",
    },
    {
      id: 413,
      name: "Helmet Cycling",
      price: 1299,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1557685888-2d3d303ebcab?q=80&w=500",
    },
    {
      id: 414,
      name: "Running Shoes",
      price: 3999,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500",
    },
    {
      id: 415,
      name: "Sports Socks",
      price: 349,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=500",
    },
    {
      id: 416,
      name: "Water Bottle",
      price: 499,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1602143393494-1dc0058e2d4d?q=80&w=500",
    },
    {
      id: 417,
      name: "Jump Rope",
      price: 299,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1599058917232-d750c1859d7c?q=80&w=500",
    },
    {
      id: 418,
      name: "Exercise Ball",
      price: 799,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1599058917232-d750c1859d7c?q=80&w=500",
    },
    {
      id: 419,
      name: "Push Up Bars",
      price: 449,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1599058917232-d750c1859d7c?q=80&w=500",
    },
    {
      id: 420,
      name: "Gym Bag",
      price: 899,
      category: "Sports",
      image:
        "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=500",
    },
  ],
  Beauty: [
    {
      id: 501,
      name: "Face Wash",
      price: 249,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500",
    },
    {
      id: 502,
      name: "Moisturizer Cream",
      price: 549,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=500",
    },
    {
      id: 503,
      name: "Sunscreen SPF 50",
      price: 349,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?q=80&w=500",
    },
    {
      id: 504,
      name: "Lipstick Set",
      price: 699,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1586495764447-6f8d9abb2430?q=80&w=500",
    },
    {
      id: 505,
      name: "Eye Shadow Palette",
      price: 499,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500",
    },
    {
      id: 506,
      name: "Foundation",
      price: 649,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=500",
    },
    {
      id: 507,
      name: "Mascara",
      price: 399,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1591360236480-4ed861025a18?q=80&w=500",
    },
    {
      id: 508,
      name: "Hair Brush",
      price: 199,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=500",
    },
    {
      id: 509,
      name: "Hair Dryer",
      price: 1299,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=500",
    },
    {
      id: 510,
      name: "Hair Oil",
      price: 179,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1610398041456-a150893f124c?q=80&w=500",
    },
    {
      id: 511,
      name: "Shampoo",
      price: 149,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500",
    },
    {
      id: 512,
      name: "Conditioner",
      price: 149,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500",
    },
    {
      id: 513,
      name: "Face Mask",
      price: 299,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500",
    },
    {
      id: 514,
      name: "Concealer",
      price: 399,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=500",
    },
    {
      id: 515,
      name: "Blush On",
      price: 349,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500",
    },
    {
      id: 516,
      name: "Nail Polish",
      price: 149,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1556228852-6d35a585d566?q=80&w=500",
    },
    {
      id: 517,
      name: "Eye Liner",
      price: 199,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500",
    },
    {
      id: 518,
      name: "Beauty Blender",
      price: 249,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500",
    },
    {
      id: 519,
      name: "Tweezers",
      price: 129,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500",
    },
    {
      id: 520,
      name: "Bath Bomb Set",
      price: 399,
      category: "Beauty",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500",
    },
  ],
  Toys: [
    {
      id: 601,
      name: "LEGO Star Wars",
      price: 1999,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=500",
    },
    {
      id: 602,
      name: "LEGO City",
      price: 1499,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360327?q=80&w=500",
    },
    {
      id: 603,
      name: "Remote Car",
      price: 999,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=500",
    },
    {
      id: 604,
      name: "Drone Mini",
      price: 2999,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=500",
    },
    {
      id: 605,
      name: "Action Figure",
      price: 499,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=500",
    },
    {
      id: 606,
      name: "Board Game Chess",
      price: 699,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1529697210530-8c4838efaf81?q=80&w=500",
    },
    {
      id: 607,
      name: "Puzzle 1000 Piece",
      price: 349,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1586281380349-631531a744c2?q=80&w=500",
    },
    {
      id: 608,
      name: "Rubik's Cube",
      price: 199,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?q=80&w=500",
    },
    {
      id: 609,
      name: "Yo-yo",
      price: 149,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360327?q=80&w=500",
    },
    {
      id: 610,
      name: "Spinning Top",
      price: 129,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=500",
    },
    {
      id: 611,
      name: "Plush Toy",
      price: 399,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?q=80&w=500",
    },
    {
      id: 612,
      name: "Water Gun",
      price: 349,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=500",
    },
    {
      id: 613,
      name: "Frisbee",
      price: 199,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?q=80&w=500",
    },
    {
      id: 614,
      name: "Kite Flying",
      price: 179,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360327?q=80&w=500",
    },
    {
      id: 615,
      name: "Bubble Maker",
      price: 149,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=500",
    },
    {
      id: 616,
      name: "Toy Train Set",
      price: 1299,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=500",
    },
    {
      id: 617,
      name: "Play Tent",
      price: 1699,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360327?q=80&w=500",
    },
    {
      id: 618,
      name: "Building Blocks",
      price: 599,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=500",
    },
    {
      id: 619,
      name: "Toy Car Set",
      price: 799,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=500",
    },
    {
      id: 620,
      name: "Jump Stilts",
      price: 449,
      category: "Toys",
      image:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360327?q=80&w=500",
    },
  ],
};

export default productsData;
