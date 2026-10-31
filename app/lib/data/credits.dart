// Attribution data for the Profil → "Sumber data & kredit foto" page.

class PhotoCredit {
  final String file; // basename in assets/img (without .jpg)
  final String title;
  final String author;
  final String license;
  final String source;
  const PhotoCredit(this.file, this.title, this.author, this.license, this.source);
  String get asset => 'assets/img/$file.jpg';
}

/// Photos bundled in assets/img. Mirrors web/src/lib/photo-credits.json (all eight files ship in the app).
const photoCredits = [
  PhotoCredit('semeru_calm', 'Bromo and Semeru volcanoes, Java, Indonesia, 20220820 0717 9517.jpg', 'Jakub Hałun',
      'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Bromo_and_Semeru_volcanoes,_Java,_Indonesia,_20220820_0717_9517.jpg'),
  PhotoCredit('mahameru', 'Mount Semeru.jpg', 'Pambudiyoga', 'CC BY-SA 4.0',
      'https://commons.wikimedia.org/wiki/File:Mount_Semeru.jpg'),
  PhotoCredit('semeru_cctv', '2021 Semeru Eruption from Oro Oro Ombo.jpg', 'Indonesian National Board for Disaster Management',
      'Public domain', 'https://commons.wikimedia.org/wiki/File:2021_Semeru_Eruption_from_Oro_Oro_Ombo.jpg'),
  PhotoCredit('semeru_erupt', 'Mount Semeru erupts ESA24649799.jpeg', 'European Space Agency', 'Attribution',
      'https://commons.wikimedia.org/wiki/File:Mount_Semeru_erupts_ESA24649799.jpeg'),
  PhotoCredit('sar_lahar', 'Villages buried in ash after the eruption of Mount Semeru.jpg',
      'Indonesian National Board for Disaster Management', 'Public domain',
      'https://commons.wikimedia.org/wiki/File:Villages_buried_in_ash_after_the_eruption_of_Mount_Semeru.jpg'),
  PhotoCredit('posko_scene', 'Search and rescue efforts of the 2021 Semeru eruption.jpg',
      'Indonesian National Board for Disaster Management', 'Public domain',
      'https://commons.wikimedia.org/wiki/File:Search_and_rescue_efforts_of_the_2021_Semeru_eruption.jpg'),
  PhotoCredit('bridge', 'Ratusan rumah tertimbun abu vulkanik erupsi gunung Semeru.jpg', 'Antara TV', 'CC BY 3.0',
      'https://commons.wikimedia.org/wiki/File:Ratusan_rumah_tertimbun_abu_vulkanik_erupsi_gunung_Semeru.jpg'),
  PhotoCredit('kit_med', 'N95mask.jpg', 'Hanabishi', 'CC0', 'https://commons.wikimedia.org/wiki/File:N95mask.jpg'),
];

/// License deed links for the licenses above (none for public domain / custom attribution).
const licenseUrls = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
};

class DataCredit {
  final String name;
  final String idNote;
  final String enNote;
  final String url;
  const DataCredit(this.name, this.idNote, this.enNote, this.url);
}

const _gee = 'https://developers.google.com/earth-engine/datasets/catalog/';

const officialSources = [
  DataCredit('PVMBG / MAGMA Indonesia', 'Status level gunung api resmi (Badan Geologi, Kementerian ESDM).',
      'Official volcano alert levels (Geological Agency, Ministry of Energy).', 'https://magma.esdm.go.id'),
];

/// Google Earth Engine datasets behind the satellite signals.
const satelliteSources = [
  DataCredit('Copernicus Sentinel-1 GRD · COPERNICUS/S1_GRD', 'Radar SAR untuk perubahan lahar & lereng. Berisi data Copernicus Sentinel yang dimodifikasi.',
      'SAR radar for lahar and flank change. Contains modified Copernicus Sentinel data.', '${_gee}COPERNICUS_S1_GRD'),
  DataCredit('Sentinel-5P TROPOMI SO₂ · COPERNICUS/S5P/OFFL/L3_SO2', 'Kolom gas SO₂. Berisi data Copernicus Sentinel yang dimodifikasi.',
      'SO₂ column. Contains modified Copernicus Sentinel data.', '${_gee}COPERNICUS_S5P_OFFL_L3_SO2'),
  DataCredit('NASA FIRMS (MODIS/VIIRS) · FIRMS', 'Anomali termal / titik panas. NASA LANCE FIRMS.',
      'Thermal anomalies / hotspots. NASA LANCE FIRMS.', '${_gee}FIRMS'),
  DataCredit('NASA GPM IMERG V07 · NASA/GPM_L3/IMERG_V07', 'Curah hujan untuk risiko lahar hujan.',
      'Rainfall for rain-lahar risk.', '${_gee}NASA_GPM_L3_IMERG_V07'),
  DataCredit('NOAA GFS 0.25° · NOAA/GFS0P25', 'Prakiraan arah angin untuk sebaran abu.',
      'Wind forecast for ash dispersal.', '${_gee}NOAA_GFS0P25'),
  DataCredit('WorldPop · WorldPop/GP/100m/pop', 'Populasi terpapar (CC BY 4.0).', 'Exposed population (CC BY 4.0).',
      '${_gee}WorldPop_GP_100m_pop'),
  DataCredit('ESA WorldCover v200 · ESA/WorldCover/v200', '© ESA WorldCover project 2021, CC BY 4.0. Aset sektoral (lahan & bangunan).',
      '© ESA WorldCover project 2021, CC BY 4.0. Sector assets (land & buildings).', '${_gee}ESA_WorldCover_v200'),
  DataCredit('Google Earth Engine', 'Platform pemrosesan semua dataset satelit di atas.',
      'Processing platform for all satellite datasets above.', 'https://earthengine.google.com'),
];

/// Basemap tiles used by the in-app map (flutter_map).
const mapSources = [
  DataCredit('Esri World Imagery', 'Citra satelit: Esri, Maxar, Earthstar Geographics.',
      'Satellite imagery: Esri, Maxar, Earthstar Geographics.',
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'),
  DataCredit('Esri World Topographic Map', 'Peta topografi: Esri, HERE, Garmin, © kontributor OpenStreetMap.',
      'Topographic map: Esri, HERE, Garmin, © OpenStreetMap contributors.',
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'),
  DataCredit('OpenStreetMap', '© kontributor OpenStreetMap, data berlisensi ODbL.', '© OpenStreetMap contributors, data under ODbL.',
      'https://www.openstreetmap.org/copyright'),
];
