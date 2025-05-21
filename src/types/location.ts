
export interface Location {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface LocationsFile {
  locations: Location[];
}

// Predefined locations for Algeria (Sidi Bel Abbès province)
export const algeriaLocations: Location[] = [
  { name: "Aïn Adden", lat: 35.33539931008126, lng: -0.22692778181447396 },
  { name: "Aïn El Berd", lat: 35.392152806291755, lng: -0.5196251340013306 },
  { name: "Aïn Kada", lat: 35.152833402692075, lng: -0.8480589837320909 },
  { name: "Aïn Thrid", lat: 35.28468842665241, lng: -0.6742055948999145 },
  { name: "Aïn Tindamine", lat: 34.68928981511417, lng: -0.7204401749953833 },
  { name: "Amarnas", lat: 35.138505004822235, lng: -0.6239354836747223 },
  { name: "Badredine El Mokrani", lat: 35.00946864170731, lng: -0.8518852614661586 },
  { name: "Belarbi", lat: 35.151801372495584, lng: -0.456640426258848 },
  { name: "Ben Badis", lat: 34.95281999044866, lng: -0.9153823910152633 },
  { name: "Benachiba Chelia", lat: 34.96391591105708, lng: -0.6124433602452347 },
  { name: "Bir El Hammam", lat: 34.418364021342015, lng: -0.49855291192837387 },
  { name: "Boudjebaa El Bordj", lat: 35.352181480572234, lng: -0.32504578626389624 },
  { name: "Boukhanafis", lat: 35.06625510120401, lng: -0.7224788116510321 },
  { name: "Chettouane Belaila", lat: 34.950791387214956, lng: -0.8369332281865378 },
  { name: "Dhaya", lat: 34.67529931878416, lng: -0.6203649998801435 },
  { name: "El Haçaiba", lat: 34.69928478668768, lng: -0.7618592151506812 },
  { name: "Hassi Dahou", lat: 35.07108375368392, lng: -0.543126231074529 },
  { name: "Hassi Zehana", lat: 35.02387794505616, lng: -0.8915480833999783 },
  { name: "Lamtar", lat: 35.07148070230287, lng: -0.7984477336834628 },
  { name: "Makedra", lat: 35.44091429861544, lng: -0.4315815216553343 },
  { name: "Marhoum", lat: 34.44604009105028, lng: -0.19292903026447644 },
  { name: "M'Cid", lat: 35.138490392577516, lng: -0.24527328917863886 },
  { name: "Merine", lat: 34.77990435285181, lng: -0.44756981672404555 },
  { name: "Mezaourou", lat: 34.816153703144586, lng: -0.6229528038500382 },
  { name: "Mostefa Ben Brahim", lat: 35.19251489529976, lng: -0.35679026546000286 },
  { name: "Moulay Slissen", lat: 34.820931636283326, lng: -0.7640300078100443 },
  { name: "Oued Sebaa", lat: 34.585081239639734, lng: -0.7094074681037766 },
  { name: "Oued Sefioun", lat: 35.065909235121104, lng: -0.35738029661682386 },
  { name: "Oued Taourira", lat: 34.61939067476851, lng: -0.33787820033452226 },
  { name: "Ras El Ma", lat: 34.49815170748217, lng: -0.8236618308147882 },
  { name: "Redjem Demouche", lat: 34.42842508865919, lng: -0.8147210574823264 },
  { name: "Sehala Thaoura", lat: 35.200390478107785, lng: -0.8310257130441225 },
  { name: "Sfisef", lat: 35.23599828485509, lng: -0.23965198814739797 },
  { name: "Sidi Ali Benyoub", lat: 34.94444529566991, lng: -0.7187504031549996 },
  { name: "Sidi Ali Boussidi", lat: 35.10207005067592, lng: -0.8328204874249633 },
  { name: "Sidi Bel Abbès", lat: 35.19851472020303, lng: -0.6344868648716464 },
  { name: "Sidi Brahim", lat: 35.25595113348771, lng: -0.5689108168562034 },
  { name: "Sidi Chaib", lat: 34.59425516252499, lng: -0.5478495891716754 },
  { name: "Sidi Daho des Zairs", lat: 35.11696116861386, lng: -0.9104878133459522 },
  { name: "Sidi Hamadouche", lat: 35.299767656280764, lng: -0.5475885229938207 },
  { name: "Sidi Khaled", lat: 35.112755476003066, lng: -0.7191167794806896 },
  { name: "Sidi Lahcene", lat: 35.162020073924715, lng: -0.6973887811946273 },
  { name: "Sidi Yacoub", lat: 35.13693580625168, lng: -0.7851816676701915 },
  { name: "Tabia", lat: 35.020743156719256, lng: -0.735027704419834 },
  { name: "Tafissour", lat: 34.69208094718988, lng: -0.20276535079014438 },
  { name: "Taoudmout", lat: 34.5892064908131, lng: -0.11121443422457873 },
  { name: "Teghalimet", lat: 34.88679468833174, lng: -0.5521279730619225 },
  { name: "Telagh", lat: 34.78283969694755, lng: -0.5727184559595978 },
  { name: "Tenira", lat: 35.02149297741197, lng: -0.527870514152152 },
  { name: "Tessala", lat: 35.243061973857714, lng: -0.7702144444095173 },
  { name: "Tilmouni", lat: 35.17437484241455, lng: -0.547511571318433 },
  { name: "Zerouala", lat: 35.24310765815227, lng: -0.5220697020920787 }
];
