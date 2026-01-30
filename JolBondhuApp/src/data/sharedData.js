// JolBondhu+ Citizen App - Shared Data
// This data structure matches the admin dashboard for consistency

export const basins = [
    {
        id: "jalukbari",
        name: "Jalukbari (Main)",
        nameAssamese: "জালুকবাৰী (মুখ্য)",
        location: "Guwahati, Kamrup",
        locationAssamese: "গুৱাহাটী, কামrup",
        riskLevel: "High",
        rainfall: 45.2,
        riverLevel: "48.2",
        drainageBlockage: 72,
        estimatedWaterLevel: 2.5,
        coords: [26.1445, 91.6616],
        polygon: [
            [26.1500, 91.6550],
            [26.1520, 91.6650],
            [26.1480, 91.6720],
            [26.1400, 91.6700],
            [26.1380, 91.6600],
            [26.1420, 91.6530],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 25 },
            { time: '07:00', rainfall: 32 },
            { time: '08:00', rainfall: 38 },
            { time: '09:00', rainfall: 42 },
            { time: '10:00', rainfall: 45 },
            { time: '11:00', rainfall: 45.2 },
        ]
    },
    {
        id: "maligaon",
        name: "Maligaon",
        nameAssamese: "মালিগাঁও",
        location: "Guwahati, Kamrup",
        locationAssamese: "গুৱাহাটী, কামrup",
        riskLevel: "Medium",
        rainfall: 32.8,
        riverLevel: "32.1",
        drainageBlockage: 45,
        estimatedWaterLevel: 1.2,
        coords: [26.1520, 91.6750],
        polygon: [
            [26.1560, 91.6700],
            [26.1580, 91.6800],
            [26.1540, 91.6850],
            [26.1480, 91.6820],
            [26.1470, 91.6720],
            [26.1510, 91.6680],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 15 },
            { time: '07:00', rainfall: 20 },
            { time: '08:00', rainfall: 25 },
            { time: '09:00', rainfall: 28 },
            { time: '10:00', rainfall: 31 },
            { time: '11:00', rainfall: 32.8 },
        ]
    },
    {
        id: "fancy-bazar",
        name: "Fancy Bazar",
        nameAssamese: "ফেঞ্চী বজাৰ",
        location: "Guwahati, Kamrup",
        locationAssamese: "গুৱাহাটী, কামrup",
        riskLevel: "Low",
        rainfall: 18.5,
        riverLevel: "18.5",
        drainageBlockage: 28,
        estimatedWaterLevel: 0.5,
        coords: [26.1600, 91.6900],
        polygon: [
            [26.1640, 91.6850],
            [26.1660, 91.6950],
            [26.1620, 91.6980],
            [26.1560, 91.6950],
            [26.1550, 91.6870],
            [26.1590, 91.6830],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 8 },
            { time: '07:00', rainfall: 11 },
            { time: '08:00', rainfall: 14 },
            { time: '09:00', rainfall: 16 },
            { time: '10:00', rainfall: 17.5 },
            { time: '11:00', rainfall: 18.5 },
        ]
    },
    {
        id: "bharalumukh",
        name: "Bharalumukh",
        nameAssamese: "ভৰলুমুখ",
        location: "Guwahati, Kamrup",
        locationAssamese: "গুৱাহাটী, কামrup",
        riskLevel: "Medium",
        rainfall: 38.1,
        riverLevel: "28.9",
        drainageBlockage: 55,
        estimatedWaterLevel: 1.8,
        coords: [26.1350, 91.6800],
        polygon: [
            [26.1400, 91.6750],
            [26.1420, 91.6850],
            [26.1380, 91.6900],
            [26.1300, 91.6870],
            [26.1290, 91.6780],
            [26.1340, 91.6720],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 18 },
            { time: '07:00', rainfall: 24 },
            { time: '08:00', rainfall: 30 },
            { time: '09:00', rainfall: 34 },
            { time: '10:00', rainfall: 36.5 },
            { time: '11:00', rainfall: 38.1 },
        ]
    },
    {
        id: "brahmaputra-north",
        name: "Brahmaputra North Bank",
        nameAssamese: "ব্ৰহ্মপুত্ৰ উত্তৰ পাৰ",
        location: "Sonitpur District",
        locationAssamese: "শোণিতপুৰ জিলা",
        riskLevel: "High",
        rainfall: 45,
        riverLevel: "48.2",
        drainageBlockage: 68,
        estimatedWaterLevel: 2.8,
        coords: [26.6736, 92.8478],
        polygon: [
            [26.6800, 92.8300],
            [26.6850, 92.8500],
            [26.6750, 92.8650],
            [26.6600, 92.8600],
            [26.6550, 92.8400],
            [26.6650, 92.8250],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 22 },
            { time: '07:00', rainfall: 30 },
            { time: '08:00', rainfall: 36 },
            { time: '09:00', rainfall: 41 },
            { time: '10:00', rainfall: 44 },
            { time: '11:00', rainfall: 45 },
        ]
    },
    {
        id: "barpeta",
        name: "Barpeta Zone",
        nameAssamese: "বৰপেটা অঞ্চল",
        location: "Barpeta District",
        locationAssamese: "বৰপেটা জিলা",
        riskLevel: "Medium",
        rainfall: 28,
        riverLevel: "32.1",
        drainageBlockage: 42,
        estimatedWaterLevel: 1.5,
        coords: [26.3225, 91.0055],
        polygon: [
            [26.3300, 90.9900],
            [26.3350, 91.0100],
            [26.3250, 91.0250],
            [26.3100, 91.0200],
            [26.3050, 91.0000],
            [26.3150, 90.9850],
        ],
        rainfallData: [
            { time: '06:00', rainfall: 12 },
            { time: '07:00', rainfall: 16 },
            { time: '08:00', rainfall: 20 },
            { time: '09:00', rainfall: 24 },
            { time: '10:00', rainfall: 26.5 },
            { time: '11:00', rainfall: 28 },
        ]
    }
];

export const alerts = [
    {
        id: "1",
        basinId: "jalukbari",
        type: "flood_warning",
        severity: "high",
        title: "Flood Warning - Jalukbari",
        titleAssamese: "বান সতৰ্কবাণী - জালুকবাৰী",
        message: "Water level rising rapidly. Avoid low-lying areas near Gauhati University.",
        messageAssamese: "পানীৰ স্তৰ বেগাই বাঢ়িছে। গুৱাহাটী বিশ্ববিদ্যালয়ৰ ওচৰৰ নিম্নাঞ্চল এৰাই চলক।",
        time: "5 mins ago",
        isNew: true
    },
    {
        id: "2",
        basinId: "brahmaputra-north",
        type: "flood_warning",
        severity: "high",
        title: "Danger Level Alert - Brahmaputra",
        titleAssamese: "বিপদ স্তৰ সতৰ্কবাণী - ব্ৰহ্মপুত্ৰ",
        message: "River crossing danger mark. Stay away from riverbanks.",
        messageAssamese: "নদী বিপদ চিহ্ন পাৰ কৰিছে। নদীৰ পাৰৰ পৰা আঁতৰি থাকক।",
        time: "20 mins ago",
        isNew: true
    },
    {
        id: "3",
        basinId: "maligaon",
        type: "waterlogging",
        severity: "medium",
        title: "Waterlogging Alert - Maligaon",
        titleAssamese: "জলবন্ধতা সতৰ্কবাণী - মালিগাঁও",
        message: "Drainage overflow reported near railway station. Use alternate routes.",
        messageAssamese: "ৰেলৱে ষ্টেচনৰ ওচৰত নলাৰ পানী উফন্দি পৰাৰ খবৰ পোৱা গৈছে। বিকল্প পথ ব্যৱহাৰ কৰক।",
        time: "30 mins ago",
        isNew: false
    },
    {
        id: "4",
        basinId: "bharalumukh",
        type: "drain_block",
        severity: "medium",
        title: "Drain Blockage - Bharalumukh",
        titleAssamese: "নলা অৱৰোধ - ভৰলুমুখ",
        message: "Municipal team dispatched to clear blocked drain. Expect delays.",
        messageAssamese: "অৱৰুদ্ধ নলা পৰিষ্কাৰ কৰিবলৈ পৌৰ দল প্ৰেৰণ কৰা হৈছে। পলম হ'ব বুলি আশা কৰক।",
        time: "1 hour ago",
        isNew: false
    },
    {
        id: "5",
        basinId: "fancy-bazar",
        type: "all_clear",
        severity: "low",
        title: "Situation Normal - Fancy Bazar",
        titleAssamese: "স্বাভাৱিক পৰিস্থিতি - ফেঞ্চী বজাৰ",
        message: "Water levels receding. Roads are clear for normal traffic.",
        messageAssamese: "পানীৰ স্তৰ কমি আছে। সাধাৰণ যান-বাহনৰ বাবে পথ মুক্ত।",
        time: "2 hours ago",
        isNew: false
    }
];

export const safetyGuidelines = {
    high: [
        { en: "Move to higher ground immediately if in flood-prone area", as: "বান-প্ৰৱণ অঞ্চলত থাকিলে তৎক্ষণাত ওখ ঠাইলৈ যাওক" },
        { en: "Do not walk or drive through flood waters", as: "বানৰ পানীত খোজ কাঢ়ি বা গাড়ী চলাই নাযাব" },
        { en: "Keep emergency kit ready with torch, water, medicines", as: "টৰ্চ, পানী, ঔষধৰ সৈতে জৰুৰীকালীন কিট সাজু ৰাখক" },
        { en: "Stay away from electric poles and fallen wires", as: "বৈদ্যুতিক খুঁটা আৰু পৰি যোৱা তাঁৰৰ পৰা আঁতৰি থাকক" },
        { en: "Call emergency helpline if trapped", as: "ফচি পৰিলে জৰুৰীকালীন হেল্পলাইনত ফোন কৰক" }
    ],
    medium: [
        { en: "Stay updated with weather alerts", as: "বতৰ সতৰ্কবাণীৰ সৈতে আপডেট থাকক" },
        { en: "Avoid waterlogged roads and low-lying areas", as: "জলবন্ধ পথ আৰু নিম্নাঞ্চল এৰাই চলক" },
        { en: "Keep important documents in waterproof bags", as: "গুৰুত্বপূৰ্ণ নথিপত্ৰ জলৰোধী বেগত ৰাখক" },
        { en: "Charge your phone and keep power bank ready", as: "আপোনাৰ ফোন চাৰ্জ কৰক আৰু পাৱাৰ বেংক সাজু ৰাখক" }
    ],
    low: [
        { en: "Monitor weather updates regularly", as: "নিয়মীয়াকৈ বতৰৰ আপডেট নিৰীক্ষণ কৰক" },
        { en: "Ensure drains near your home are clear", as: "আপোনাৰ ঘৰৰ ওচৰৰ নলা পৰিষ্কাৰ আছে নে নাই নিশ্চিত কৰক" },
        { en: "Keep emergency contact numbers handy", as: "জৰুৰীকালীন যোগাযোগ নম্বৰ হাতৰ ওচৰত ৰাখক" }
    ]
};

export const emergencyContacts = [
    { name: "Flood Control Room", nameAssamese: "বান নিয়ন্ত্ৰণ কক্ষ", phone: "1079", icon: "phone" },
    { name: "NDRF Helpline", nameAssamese: "এন ডি আৰ এফ হেল্পলাইন", phone: "9711077372", icon: "shield" },
    { name: "State Emergency", nameAssamese: "ৰাজ্যিক জৰুৰীকালীন", phone: "108", icon: "siren" },
    { name: "Police", nameAssamese: "আৰক্ষী", phone: "100", icon: "badge" },
    { name: "Fire & Rescue", nameAssamese: "অগ্নি আৰু উদ্ধাৰ", phone: "101", icon: "flame" }
];

export const translations = {
    en: {
        appName: "JolBondhu+",
        appTagline: "Your Flood Safety Companion",
        home: "Home",
        map: "Map",
        report: "Report",
        alerts: "Alerts",
        safety: "Safety",

        // Home page
        currentAlerts: "Current Alerts",
        zoneStatus: "Zone Status",
        highRisk: "High Risk",
        mediumRisk: "Medium Risk",
        lowRisk: "Low Risk",
        viewAll: "View All",
        quickActions: "Quick Actions",
        reportIssue: "Report Issue",
        viewMap: "View Map",
        safetyTips: "Safety Tips",

        // Map page
        floodMap: "Flood Risk Map",
        yourLocation: "Your Location",
        tapZoneInfo: "Tap a zone for details",

        // Report page
        reportProblem: "Report a Problem",
        issueType: "Issue Type",
        waterlogging: "Waterlogging",
        drainBlock: "Drain Blockage",
        floodDamage: "Flood Damage",
        roadBlock: "Road Blocked",
        other: "Other",
        description: "Description",
        descriptionPlaceholder: "Describe the issue...",
        addPhoto: "Add Photo",
        yourLocation: "Your Location",
        gettingLocation: "Getting location...",
        submit: "Submit Report",
        submitting: "Submitting...",
        reportSuccess: "Report submitted successfully!",
        reportQueued: "Report saved. Will upload when online.",

        // Alerts page
        allAlerts: "All Alerts",
        filterByZone: "Filter by zone",
        allZones: "All Zones",
        newAlert: "NEW",

        // Safety page
        safetyGuidelines: "Safety Guidelines",
        emergencyContacts: "Emergency Contacts",
        basedOnRisk: "Based on current risk level",
        tapToCall: "Tap to call",

        // Status
        online: "Online",
        offline: "Offline - Data saved locally",
        lastUpdated: "Last updated",
        pendingReports: "pending reports",

        // Risk levels
        high: "High",
        medium: "Medium",
        low: "Low",

        // Common
        loading: "Loading...",
        error: "Error",
        retry: "Retry",
        cancel: "Cancel",
        close: "Close",
        back: "Back"
    },
    as: {
        appName: "জলবন্ধু+",
        appTagline: "আপোনাৰ বান সুৰক্ষা সংগী",
        home: "হোম",
        map: "মেপ",
        report: "প্ৰতিবেদন",
        alerts: "সতৰ্কবাণী",
        safety: "সুৰক্ষা",

        // Home page
        currentAlerts: "বৰ্তমান সতৰ্কবাণী",
        zoneStatus: "অঞ্চলৰ স্থিতি",
        highRisk: "উচ্চ বিপদ",
        mediumRisk: "মধ্যম বিপদ",
        lowRisk: "কম বিপদ",
        viewAll: "সকলো চাওক",
        quickActions: "দ্ৰুত কাৰ্য",
        reportIssue: "সমস্যা জনাওক",
        viewMap: "মেপ চাওক",
        safetyTips: "সুৰক্ষা টিপছ",

        // Map page
        floodMap: "বান বিপদ মেপ",
        yourLocation: "আপোনাৰ অৱস্থান",
        tapZoneInfo: "বিৱৰণৰ বাবে অঞ্চলত টেপ কৰক",

        // Report page
        reportProblem: "সমস্যা জনাওক",
        issueType: "সমস্যাৰ প্ৰকাৰ",
        waterlogging: "জলবন্ধতা",
        drainBlock: "নলা অৱৰোধ",
        floodDamage: "বান ক্ষতি",
        roadBlock: "পথ অৱৰুদ্ধ",
        other: "অন্যান্য",
        description: "বিৱৰণ",
        descriptionPlaceholder: "সমস্যাটো বৰ্ণনা কৰক...",
        addPhoto: "ফটো যোগ কৰক",
        gettingLocation: "অৱস্থান লোৱা হৈছে...",
        submit: "প্ৰতিবেদন দাখিল কৰক",
        submitting: "দাখিল কৰি আছে...",
        reportSuccess: "প্ৰতিবেদন সফলতাৰে দাখিল হ'ল!",
        reportQueued: "প্ৰতিবেদন সংৰক্ষিত। অনলাইন হ'লে আপলোড হ'ব।",

        // Alerts page
        allAlerts: "সকলো সতৰ্কবাণী",
        filterByZone: "অঞ্চল অনুসৰি ফিল্টাৰ কৰক",
        allZones: "সকলো অঞ্চল",
        newAlert: "নতুন",

        // Safety page
        safetyGuidelines: "সুৰক্ষা নিৰ্দেশনা",
        emergencyContacts: "জৰুৰীকালীন যোগাযোগ",
        basedOnRisk: "বৰ্তমান বিপদ স্তৰৰ ওপৰত ভিত্তি কৰি",
        tapToCall: "কল কৰিবলৈ টেপ কৰক",

        // Status
        online: "অনলাইন",
        offline: "অফলাইন - ডাটা স্থানীয়ভাৱে সংৰক্ষিত",
        lastUpdated: "শেষ আপডেট",
        pendingReports: "বাকী প্ৰতিবেদন",

        // Risk levels
        high: "উচ্চ",
        medium: "মধ্যম",
        low: "কম",

        // Common
        loading: "লোড হৈ আছে...",
        error: "ত্ৰুটি",
        retry: "পুনৰ চেষ্টা কৰক",
        cancel: "বাতিল",
        close: "বন্ধ",
        back: "পিছলৈ"
    }
};

// Issue types for reporting
export const issueTypes = [
    { id: 'waterlogging', en: 'Waterlogging', as: 'জলবন্ধতা', icon: 'droplets' },
    { id: 'drain_block', en: 'Drain Blockage', as: 'নলা অৱৰোধ', icon: 'construction' },
    { id: 'flood_damage', en: 'Flood Damage', as: 'বান ক্ষতি', icon: 'home' },
    { id: 'road_block', en: 'Road Blocked', as: 'পথ অৱৰুদ্ধ', icon: 'road' },
    { id: 'other', en: 'Other', as: 'অন্যান্য', icon: 'help-circle' }
];
