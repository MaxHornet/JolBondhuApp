// Station Polygons Data for 71 Water Level Stations
// Each station gets a small polygon area around its coordinates

export const generateStationPolygon = (lat, lon, radiusMeters = 500) => {
  // Generate a small hexagon around the station point
  const points = 6;
  const latOffset = radiusMeters / 111320; // meters to degrees (approx)
  const lonOffset = radiusMeters / (111320 * Math.cos(lat * Math.PI / 180));
  
  const polygon = [];
  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const offsetLat = latOffset * Math.cos(angle);
    const offsetLon = lonOffset * Math.sin(angle);
    polygon.push([lat + offsetLat, lon + offsetLon]);
  }
  return polygon;
};

export const stationPolygons = [
  {
    id: "wl_71",
    stationCode: "033-LBDJPG",
    name: "AIE NH XING",
    lat: 26.497777777777777,
    lon: 90.655,
    district: "BONGAIGAON",
    riverName: "Aie",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.4978, 90.655, 800)
  },
  {
    id: "wl_51",
    stationCode: "017-MBDghy",
    name: "Amraghat",
    lat: 24.605833333333333,
    lon: 92.9538888888889,
    district: "CACHAR",
    riverName: "Sonai",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.6058, 92.9539, 800)
  },
  {
    id: "wl_45",
    stationCode: "008-MDSIL",
    name: "ANIPUR",
    lat: 24.54361111111111,
    lon: 92.43305555555555,
    district: "KARIMGANJ",
    riverName: "Singla",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.5436, 92.4331, 800)
  },
  {
    id: "wl_57",
    stationCode: "01-11-01-007",
    name: "Annapurna Ghat",
    lat: 24.83277777777778,
    lon: 92.79166666666667,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.8328, 92.7917, 800)
  },
  {
    id: "wl_58",
    stationCode: "01-11-01-006",
    name: "Badarpur Ghat",
    lat: 24.87527777777778,
    lon: 92.57833333333333,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.8753, 92.5783, 800)
  },
  {
    id: "wl_10",
    stationCode: "022-UBDDIB",
    name: "Badatighat",
    lat: 26.934722222222224,
    lon: 93.96222222222222,
    district: "DIBRUGARH",
    riverName: "Subansiri",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.9347, 93.9622, 800)
  },
  {
    id: "wl_31",
    stationCode: "034-LBDJPG",
    name: "BAHALPUR",
    lat: 26.31833333333333,
    lon: 90.46888888888888,
    district: "BONGAIGAON",
    riverName: "Champamati",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.3183, 90.4689, 800)
  },
  {
    id: "wl_32",
    stationCode: "046-LBDJPG",
    name: "Baladoba",
    lat: 26.01888888888889,
    lon: 89.82944444444443,
    district: "DHUBRI",
    riverName: "Sankosh",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.0189, 89.8294, 800)
  },
  {
    id: "wl_33",
    stationCode: "037-LBDJPG",
    name: "BALLAMGURI",
    lat: 26.52333333333333,
    lon: 90.89611111111111,
    district: "BONGAIGAON",
    riverName: "Beki",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.5233, 90.8961, 800)
  },
  {
    id: "wl_34",
    stationCode: "039-LBDJPG",
    name: "BAMUNIGAON",
    lat: 26.44888888888889,
    lon: 90.78388888888888,
    district: "BONGAIGAON",
    riverName: "Beki",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.4489, 90.7839, 800)
  },
  {
    id: "wl_35",
    stationCode: "040-LBDJPG",
    name: "BANKA",
    lat: 26.24388888888889,
    lon: 90.62555555555555,
    district: "BONGAIGAON",
    riverName: "Beki",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.2439, 90.6256, 800)
  },
  {
    id: "wl_36",
    stationCode: "011-LBDSIL",
    name: "Barpeta Road",
    lat: 26.32638888888889,
    lon: 90.96111111111111,
    district: "BARPETA",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.3264, 90.9611, 800)
  },
  {
    id: "wl_37",
    stationCode: "038-LBDJPG",
    name: "BISHWANATH",
    lat: 26.41055555555556,
    lon: 90.60138888888889,
    district: "SONITPUR",
    riverName: "Beki",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.4106, 90.6014, 800)
  },
  {
    id: "wl_38",
    stationCode: "045-LBDJPG",
    name: "Brahmaputra at Dhubri",
    lat: 25.57222222222222,
    lon: 89.93777777777778,
    district: "DHUBRI",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(25.5722, 89.9378, 1200)
  },
  {
    id: "wl_39",
    stationCode: "044-LBDJPG",
    name: "Brahmaputra at Pandu",
    lat: 26.18444444444444,
    lon: 91.65611111111111,
    district: "KAMRUP",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(26.1844, 91.6561, 1200)
  },
  {
    id: "wl_40",
    stationCode: "042-LBDJPG",
    name: "Brahmaputra at Tezpur",
    lat: 26.63777777777778,
    lon: 92.80027777777778,
    district: "SONITPUR",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(26.6378, 92.8003, 1200)
  },
  {
    id: "wl_41",
    stationCode: "041-LBDJPG",
    name: "Brajong",
    lat: 26.74305555555556,
    lon: 92.68944444444444,
    district: "SONITPUR",
    riverName: "Bhorolu",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.7431, 92.6894, 800)
  },
  {
    id: "wl_42",
    stationCode: "043-LBDJPG",
    name: "Chapakua",
    lat: 26.59722222222222,
    lon: 92.78388888888889,
    district: "SONITPUR",
    riverName: "Bhorolu",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.5972, 92.7839, 800)
  },
  {
    id: "wl_43",
    stationCode: "021-UBDNGL",
    name: "Chemoldong",
    lat: 27.47861111111111,
    lon: 94.03666666666666,
    district: "SIBSAGAR",
    riverName: "Disang",
    riskLevel: "Low",
    polygon: generateStationPolygon(27.4786, 94.0367, 800)
  },
  {
    id: "wl_44",
    stationCode: "027-UBDNGL",
    name: "Dibrugarh",
    lat: 27.47222222222222,
    lon: 94.91027777777778,
    district: "DIBRUGARH",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.4722, 94.9103, 1000)
  },
  {
    id: "wl_46",
    stationCode: "025-UBDSIL",
    name: "Garamur",
    lat: 27.95416666666667,
    lon: 95.37166666666667,
    district: "DHAKUAKHANA",
    riverName: "Lohit",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.9542, 95.3717, 800)
  },
  {
    id: "wl_47",
    stationCode: "028-UBDSIL",
    name: "Ghagmora",
    lat: 26.94055555555556,
    lon: 94.59694444444444,
    district: "DIBRUGARH",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.9406, 94.5969, 800)
  },
  {
    id: "wl_48",
    stationCode: "047-LBDJPG",
    name: "Goalpara",
    lat: 26.16222222222222,
    lon: 90.61722222222222,
    district: "GOALPARA",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.1622, 90.6172, 1000)
  },
  {
    id: "wl_49",
    stationCode: "020-UBDJRA",
    name: "Gogamukh",
    lat: 27.24583333333333,
    lon: 93.81583333333333,
    district: "DHEMAJ",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.2458, 93.8158, 800)
  },
  {
    id: "wl_50",
    stationCode: "026-UBDNGL",
    name: "Jhanji",
    lat: 27.05611111111111,
    lon: 94.57888888888889,
    district: "SIBSAGAR",
    riverName: "Jhanji",
    riskLevel: "Low",
    polygon: generateStationPolygon(27.0561, 94.5789, 800)
  },
  {
    id: "wl_52",
    stationCode: "029-UBDNGL",
    name: "Kahikuchi",
    lat: 26.11111111111111,
    lon: 91.58888888888889,
    district: "KAMRUP",
    riverName: "Bharali",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.1111, 91.5889, 800)
  },
  {
    id: "wl_53",
    stationCode: "001-01-01-01",
    name: "Kakoi Pathar",
    lat: 27.23416666666667,
    lon: 94.12583333333333,
    district: "DHEMAJ",
    riverName: "Kakoi",
    riskLevel: "Low",
    polygon: generateStationPolygon(27.2342, 94.1258, 800)
  },
  {
    id: "wl_54",
    stationCode: "01-11-01-001",
    name: "Kalaimal",
    lat: 24.37555555555556,
    lon: 92.53527777777778,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.3756, 92.5353, 800)
  },
  {
    id: "wl_55",
    stationCode: "022-UBDNGL",
    name: "Kamalabari",
    lat: 27.34333333333333,
    lon: 94.13611111111111,
    district: "MAJULI",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.3433, 94.1361, 800)
  },
  {
    id: "wl_56",
    stationCode: "023-UBDNGL",
    name: "Kamalabari Ghat",
    lat: 27.32055555555556,
    lon: 94.10138888888889,
    district: "MAJULI",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.3206, 94.1014, 800)
  },
  {
    id: "wl_59",
    stationCode: "024-UBDNGL",
    name: "Khatkhati",
    lat: 27.28916666666667,
    lon: 94.07611111111111,
    district: "MAJULI",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.2892, 94.0761, 800)
  },
  {
    id: "wl_60",
    stationCode: "012-LBDSIL",
    name: "Kokrajhar",
    lat: 26.39777777777778,
    lon: 90.26611111111111,
    district: "KOKRAJHAR",
    riverName: "Garo",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.3978, 90.2661, 800)
  },
  {
    id: "wl_61",
    stationCode: "015-MBCACH",
    name: "Krishnai",
    lat: 26.00555555555556,
    lon: 90.62583333333333,
    district: "GOALPARA",
    riverName: "Krishnai",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.0056, 90.6258, 800)
  },
  {
    id: "wl_62",
    stationCode: "019-UBDJRA",
    name: "Lakhipur",
    lat: 26.78805555555556,
    lon: 92.72194444444444,
    district: "GOLAGHAT",
    riverName: "Dhansiri",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.7881, 92.7219, 800)
  },
  {
    id: "wl_63",
    stationCode: "014-MBNAGA",
    name: "Lakhipur",
    lat: 24.53583333333333,
    lon: 92.89111111111111,
    district: "CACHAR",
    riverName: "Madhura",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.5358, 92.8911, 800)
  },
  {
    id: "wl_64",
    stationCode: "016-MBDghy",
    name: "Lower Dhansiri",
    lat: 26.18833333333333,
    lon: 92.58111111111111,
    district: "GOLAGHAT",
    riverName: "Dhansiri",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.1883, 92.5811, 800)
  },
  {
    id: "wl_65",
    stationCode: "01-11-01-004",
    name: "Mahur",
    lat: 24.97277777777778,
    lon: 92.86111111111111,
    district: "CACHAR",
    riverName: "Mahur",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.9728, 92.8611, 800)
  },
  {
    id: "wl_66",
    stationCode: "018-UBDNGL",
    name: "Majuli",
    lat: 27.48583333333333,
    lon: 94.23583333333333,
    district: "MAJULI",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(27.4858, 94.2358, 1000)
  },
  {
    id: "wl_67",
    stationCode: "030-UBDNGL",
    name: "Mora Diphlu",
    lat: 26.76555555555556,
    lon: 93.98944444444444,
    district: "NAGAON",
    riverName: "Diphlu",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.7656, 93.9894, 800)
  },
  {
    id: "wl_68",
    stationCode: "01-11-01-002",
    name: "NITEL",
    lat: 24.42611111111111,
    lon: 92.54111111111111,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.4261, 92.5411, 800)
  },
  {
    id: "wl_69",
    stationCode: "013-LBDSIL",
    name: "North Salmara",
    lat: 26.33083333333333,
    lon: 90.70722222222222,
    district: "BARPETA",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(26.3308, 90.7072, 1000)
  },
  {
    id: "wl_70",
    stationCode: "031-UBDNGL",
    name: "Nutan Chauk",
    lat: 26.64361111111111,
    lon: 93.94166666666666,
    district: "NAGAON",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.6436, 93.9417, 800)
  },
  {
    id: "wl_72",
    stationCode: "032-UBDNGL",
    name: "Pabitora",
    lat: 26.225,
    lon: 92.42083333333333,
    district: "NAGAON",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.225, 92.4208, 800)
  },
  {
    id: "wl_73",
    stationCode: "01-11-01-005",
    name: "Panjpai",
    lat: 24.75555555555556,
    lon: 92.69555555555555,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.7556, 92.6956, 800)
  },
  {
    id: "wl_74",
    stationCode: "046-UBDNGL",
    name: "Pasighat",
    lat: 28.06666666666667,
    lon: 95.33333333333333,
    district: "PASIGHAT",
    riverName: "Siang",
    riskLevel: "Medium",
    polygon: generateStationPolygon(28.0667, 95.3333, 800)
  },
  {
    id: "wl_75",
    stationCode: "036-LBDJPG",
    name: "Patanjala",
    lat: 26.28583333333333,
    lon: 90.71833333333333,
    district: "BARPETA",
    riverName: "Poonch",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.2858, 90.7183, 800)
  },
  {
    id: "wl_76",
    stationCode: "033-UBDNGL",
    name: "Rahmari",
    lat: 26.89638888888889,
    lon: 94.24194444444444,
    district: "NAGAON",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(26.8964, 94.2419, 1000)
  },
  {
    id: "wl_77",
    stationCode: "01-11-01-003",
    name: "Ratabari",
    lat: 24.38333333333333,
    lon: 92.47527777777778,
    district: "CACHAR",
    riverName: "Barak",
    riskLevel: "Low",
    polygon: generateStationPolygon(24.3833, 92.4753, 800)
  },
  {
    id: "wl_78",
    stationCode: "035-LBDJPG",
    name: "Sorbhog",
    lat: 26.52194444444444,
    lon: 90.59555555555555,
    district: "BONGAIGAON",
    riverName: "Beki",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.5219, 90.5956, 800)
  },
  {
    id: "wl_79",
    stationCode: "047-UBDNGL",
    name: "Sukla",
    lat: 26.85888888888889,
    lon: 93.84111111111111,
    district: "NAGAON",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.8589, 93.8411, 800)
  },
  {
    id: "wl_80",
    stationCode: "048-UBDNGL",
    name: "Sukma",
    lat: 27.12138888888889,
    lon: 93.76583333333333,
    district: "NAGAON",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.1214, 93.7658, 800)
  },
  {
    id: "wl_81",
    stationCode: "049-UBDNGL",
    name: "Tengabari",
    lat: 27.15638888888889,
    lon: 93.71166666666667,
    district: "NAGAON",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.1564, 93.7117, 800)
  },
  {
    id: "wl_82",
    stationCode: "050-UBDNGL",
    name: "Tezpur",
    lat: 26.63777777777778,
    lon: 92.80027777777778,
    district: "SONITPUR",
    riverName: "Brahmaputra",
    riskLevel: "High",
    polygon: generateStationPolygon(26.6378, 92.8003, 1000)
  },
  {
    id: "wl_83",
    stationCode: "051-UBDNGL",
    name: "Tinmile",
    lat: 26.91833333333333,
    lon: 94.31833333333333,
    district: "MAJULI",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.9183, 94.3183, 800)
  },
  {
    id: "wl_84",
    stationCode: "052-UBDNGL",
    name: "Tinsukia",
    lat: 27.48583333333333,
    lon: 95.36583333333333,
    district: "TINSUKIA",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(27.4858, 95.3658, 800)
  },
  {
    id: "wl_85",
    stationCode: "053-UBDNGL",
    name: "Tocklai",
    lat: 26.79222222222222,
    lon: 94.75666666666666,
    district: "JORHAT",
    riverName: "Tocklai",
    riskLevel: "Low",
    polygon: generateStationPolygon(26.7922, 94.7567, 800)
  },
  {
    id: "wl_86",
    stationCode: "054-UBDNGL",
    name: "Tumung",
    lat: 26.85638888888889,
    lon: 93.94222222222222,
    district: "NAGAON",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.8564, 93.9422, 800)
  },
  {
    id: "wl_87",
    stationCode: "055-UBDNGL",
    name: "Umarikuchi",
    lat: 26.72111111111111,
    lon: 92.87666666666667,
    district: "SONITPUR",
    riverName: "Bhorolu",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.7211, 92.8767, 800)
  },
  {
    id: "wl_88",
    stationCode: "056-UBDNGL",
    name: "Upper Dhansiri",
    lat: 26.35472222222222,
    lon: 93.09527777777778,
    district: "GOLAGHAT",
    riverName: "Dhansiri",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.3547, 93.0953, 800)
  },
  {
    id: "wl_89",
    stationCode: "057-UBDNGL",
    name: "Upper Kopili",
    lat: 26.05611111111111,
    lon: 93.26583333333333,
    district: "KARBI ANGLONG",
    riverName: "Kopili",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.0561, 93.2658, 800)
  },
  {
    id: "wl_90",
    stationCode: "058-UBDNGL",
    name: "Virtually at Neamatighat",
    lat: 26.77555555555556,
    lon: 94.46694444444444,
    district: "JORHAT",
    riverName: "Brahmaputra",
    riskLevel: "Medium",
    polygon: generateStationPolygon(26.7756, 94.4669, 800)
  }
];

export const getStationById = (id) => {
  return stationPolygons.find(station => station.id === id);
};

export const getStationsByDistrict = (district) => {
  return stationPolygons.filter(station => 
    station.district.toLowerCase() === district.toLowerCase()
  );
};

export const getStationsByRisk = (riskLevel) => {
  return stationPolygons.filter(station => station.riskLevel === riskLevel);
};

export const getStationByCoords = (lat, lon) => {
  const threshold = 0.01; // ~1km
  return stationPolygons.find(station => 
    Math.abs(station.lat - lat) < threshold && 
    Math.abs(station.lon - lon) < threshold
  );
};
