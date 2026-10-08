import '@expo/metro-runtime';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration & Initialization
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate item width for mobile grid
const GRID_PADDING = 12;
const GRID_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

const STORAGE_KEY = '@ben10_user_collection';
const LANGUAGE_STORAGE_KEY = '@ben10_user_language';
const USER_SESSION_KEY = '@ben10_active_user';
const LEADERBOARD_SYNC_KEY = '@ben10_leaderboard_score';
const PROFILE_DATA_KEY = '@ben10_user_profile_data';

const CONDITION_MULTIPLIERS = {
  0: 0,
  1: 0,
  2: 2.0,
  3: 1.0,
  4: 0.5,
};

const PROHIBITED_USERNAME_TERMS = [
  '69', '420', '666',
  'democrat', 'republican', 'nazi', 'fascist', 'communist', 'trump', 'biden', 'obama', 'politics',
  'god', 'jesus', 'christ', 'allah', 'buddha', 'mohammed', 'satan', 'devil', 'priest', 'bible', 'quran', 'torah',
  'admin', 'root', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'nigger', 'faggot', 'retard',
];

const SERIES_LOGOS = [
  { id: 'os-logo', name: 'Original Series', image: require('./assets/os-logo.png') },
  { id: 'af-logo', name: 'Alien Force', image: require('./assets/af-logo.png') },
  { id: 'ua-logo', name: 'Ultimate Alien', image: require('./assets/ua-logo.png') },
  { id: 'ov-logo', name: 'Omniverse', image: require('./assets/ov-logo.png') },
  { id: 'r-logo', name: 'Reboot', image: require('./assets/r-logo.png') },
];

const FLAG_OPTIONS = [
  { label: '🇺🇸 US Only', value: '🇺🇸' },
  { label: '🇳🇮 Nicaragua & 🇺🇸 US', value: '🇳🇮🇺🇸' },
  { label: '🇲🇽 Mexico & 🇺🇸 US', value: '🇲🇽🇺🇸' },
  { label: '🇨🇦 Canada & 🇺🇸 US', value: '🇨🇦🇺🇸' },
  { label: '🇬🇧 UK & 🇺🇸 US', value: '🇬🇧🇺🇸' },
  { label: '🇯🇵 Japan & 🇺🇸 US', value: '🇯🇵🇺🇸' },
];

const validateUsername = (username) => {
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { isValid: false, message: 'Username must be between 3 and 20 characters.' };
  }

  const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
  if (!alphanumericRegex.test(cleanUsername)) {
    return { isValid: false, message: 'Usernames cannot contain special symbols or punctuation.' };
  }

  for (const term of PROHIBITED_USERNAME_TERMS) {
    if (cleanUsername.includes(term)) {
      return {
        isValid: false,
        message: 'Username contains prohibited words, vulgarities, politics, or religious terms.',
      };
    }
  }

  return { isValid: true, message: '' };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const TRANSLATIONS = {
  en: {
    news: 'News',
    leaderboards: 'Leaderboards',
    stats: 'Stats',
    filter: 'Filter',
    myProfile: 'My Profile',
    settings: 'Settings',
    logout: 'Log out',
    login: 'Log In',
    register: 'Register',
    email: 'Email Address',
    password: 'Password',
    username: 'Username',
    filterOptions: 'Filter Options',
    showPointsScore: 'Show Points & Score',
    filterBySeries: 'Filter by Series:',
    allSeries: 'All Series',
    osSeries: 'Original Series (2006-2007)',
    afSeries: 'Alien Force (2008-2010)',
    displayFigures: 'Display Figures:',
    all: 'All',
    ownedOnly: 'Owned Only',
    missingOnly: 'Missing Only',
    resetFilters: 'Reset Filters',
    done: 'Done',
    collectorScore: 'COLLECTOR SCORE',
    pts: 'PTS',
    missing: 'MISSING',
    newInBox: 'NEW IN BOX',
    looseComplete: 'LOOSE - COMPLETE',
    looseIncomplete: 'LOOSE - INCOMPLETE',
    selectLanguage: 'Select Language',
    searchPlaceholder: 'Search figures across series...',
    syncLeaderboard: 'Update Leaderboard Score',
    newsTitle: 'NEWS & UPDATES',
    leaderboardTitle: 'TOP COLLECTORS',
    statsPageTitle: 'Stats Page',
    statsSortTitle: 'Sort Stats',
    mostOwnedToLeast: 'Most owned figure to least owned',
    leastOwnedToMost: 'Least owned figure to most owned',
    mostNibToLeast: 'Most owned (Brand New) to least owned',
    leastNibToMost: 'Least owned (Brand New) to most owned',
    mostLooseToLeast: 'Most owned (Loose) to least owned',
    leastLooseToMost: 'Least owned (Loose) to most owned',
    rank: 'RANK',
    user: 'USER',
    flag: 'FLAG',
    score: 'SCORE',
    userIdLabel: 'User ID',
    profileTitle: 'Profile',
    fromLivesIn: 'From/Lives in',
    favoriteSmoothy: 'Favorite Smoothy',
    favoriteSeries: 'Favorite Series',
  },
  es: {
    news: 'Noticias',
    leaderboards: 'Clasificación',
    stats: 'Estadísticas',
    filter: 'Filtros',
    myProfile: 'Mi Perfil',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de Usuario',
    filterOptions: 'Opciones de Filtro',
    showPointsScore: 'Mostrar Puntos y Puntaje',
    filterBySeries: 'Filtrar por Serie:',
    allSeries: 'Todas las Series',
    osSeries: 'Serie Original (2006-2007)',
    afSeries: 'Alien Force (2008-2010)',
    displayFigures: 'Mostrar Figuras:',
    all: 'Todas',
    ownedOnly: 'Solo Obtenidas',
    missingOnly: 'Solo Faltantes',
    resetFilters: 'Restablecer Filtros',
    done: 'Aceptar',
    collectorScore: 'PUNTAJE DE COLECCIONISTA',
    pts: 'PTS',
    missing: 'FALTANTE',
    newInBox: 'EN CAJA',
    looseComplete: 'SUELTO - COMPLETO',
    looseIncomplete: 'SUELTO - INCOMPLETO',
    selectLanguage: 'Seleccionar Idioma',
    searchPlaceholder: 'Buscar figuras en todas las series...',
    syncLeaderboard: 'Actualizar Puntaje en Tabla',
    newsTitle: 'NOTICIAS Y ACTUALIZACIONES',
    leaderboardTitle: 'TOP COLECCIONISTAS',
    statsPageTitle: 'Página de Estadísticas',
    statsSortTitle: 'Ordenar Estadísticas',
    mostOwnedToLeast: 'Más obtenidas a menos obtenidas',
    leastOwnedToMost: 'Menos obtenidas a más obtenidas',
    mostNibToLeast: 'Más obtenidas (En Caja) a menos',
    leastNibToMost: 'Menos obtenidas (En Caja) a más',
    mostLooseToLeast: 'Más obtenidas (Sueltas) a menos',
    leastLooseToMost: 'Menos obtenidas (Sueltas) a más',
    rank: 'POS',
    user: 'USUARIO',
    flag: 'BANDERA',
    score: 'PUNTAJE',
    userIdLabel: 'ID de Usuario',
    profileTitle: 'Perfil',
    fromLivesIn: 'De/Vive en',
    favoriteSmoothy: 'Smoothy Favorito',
    favoriteSeries: 'Serie Favorita',
  },
};

const NEWS_ITEMS = [
  {
    id: 'news-1',
    category: 'Release Notes',
    title: 'Omnitrix App v2.0 is Now Live!',
    date: '3 DAYS AGO',
    imageUri: 'https://via.placeholder.com/150/10B981/FFFFFF?text=v2.0+Live',
  },
  {
    id: 'news-2',
    category: 'Ben 10 Update',
    title: 'Original Series Figure Roster Updated',
    date: 'OCTOBER 01',
    imageUri: 'https://via.placeholder.com/150/2563EB/FFFFFF?text=Ben+10',
  },
];

export const calculateFigurePoints = (figure, state) => {
  if (!state || state === 0 || state === 1) return 0;
  const base = figure.basePoints || 50;
  const multiplier = CONDITION_MULTIPLIERS[state] || 0;
  return base * multiplier;
};

const LOCAL_SERIES_DATA = [
  {
    id: 'original-series',
    title: 'BEN 10',
    years: '2006 - 2007',
    logoUrl: require('./assets/os-logo.png'),
    backgroundUrl: require('./assets/os-bg.png'),
    colors: {
      headerGradient: ['#EAEBCC', '#F7F7E6'],
      darkStrip: '#2C2F20',
      primaryText: '#000000',
    },
    figures: [
      {
        id: 'os-01',
        name: 'Ben Tennyson',
        boxedImageUrl: require('./assets/os-ben-boxed.png'),
        looseImageUrl: require('./assets/os-ben-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 90, nibPct: 50, loosePct: 30 },
      },
      {
        id: 'os-02',
        name: 'Heatblast',
        boxedImageUrl: require('./assets/os-Heatblast-boxed.png'),
        looseImageUrl: require('./assets/os-Heatblast-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 85, nibPct: 50, loosePct: 30 },
      },
      {
        id: 'os-03',
        name: 'Wildmutt',
        boxedImageUrl: require('./assets/os-Wildmutt-boxed.png'),
        looseImageUrl: require('./assets/os-Wildmutt-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 78, nibPct: 40, loosePct: 38 },
      },
      {
        id: 'os-04',
        name: 'Diamondhead',
        boxedImageUrl: require('./assets/os-Diamondhead-boxed.png'),
        looseImageUrl: require('./assets/os-Diamondhead-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 92, nibPct: 50, loosePct: 30 },
      },
      {
        id: 'os-05',
        name: 'XLR8',
        boxedImageUrl: require('./assets/os-XLR8-boxed.png'),
        looseImageUrl: require('./assets/os-XLR8-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 88, nibPct: 45, loosePct: 43 },
      },
      {
        id: 'os-06',
        name: 'Grey Matter',
        boxedImageUrl: require('./assets/os-Grey Matter-boxed.png'),
        looseImageUrl: require('./assets/os-Grey Matter-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 70, nibPct: 30, loosePct: 40 },
      },
      {
        id: 'os-07',
        name: 'Four Arms',
        boxedImageUrl: require('./assets/os-Four Arms-boxed.png'),
        looseImageUrl: require('./assets/os-Four Arms-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 95, nibPct: 60, loosePct: 35 },
      },
      {
        id: 'os-08',
        name: 'Stinkfly',
        boxedImageUrl: require('./assets/os-Stinkfly-boxed.png'),
        looseImageUrl: require('./assets/os-Stinkfly-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 65, nibPct: 25, loosePct: 40 },
      },
      {
        id: 'os-09',
        name: 'Ripjaws',
        boxedImageUrl: require('./assets/os-Ripjaws-boxed.png'),
        looseImageUrl: require('./assets/os-Ripjaws-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 60, nibPct: 20, loosePct: 40 },
      },
      {
        id: 'os-10',
        name: 'Upgrade',
        boxedImageUrl: require('./assets/os-Upgrade-boxed.png'),
        looseImageUrl: require('./assets/os-Upgrade-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 82, nibPct: 42, loosePct: 40 },
      },
      {
        id: 'os-11',
        name: 'Ghostfreak',
        boxedImageUrl: require('./assets/os-Ghostfreak-boxed.png'),
        looseImageUrl: require('./assets/os-Ghostfreak-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 75, nibPct: 35, loosePct: 40 },
      },
      {
        id: 'os-12',
        name: 'Cannonbolt',
        boxedImageUrl: require('./assets/os-Cannonbolt-boxed.png'),
        looseImageUrl: require('./assets/os-Cannonbolt-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 80, nibPct: 40, loosePct: 40 },
      },
      {
        id: 'os-13',
        name: 'Cannonbolt-Fixed-Variant',
        boxedImageUrl: require('./assets/os-Cannonbolt-Fixed-Variant-boxed.png'),
        looseImageUrl: require('./assets/os-Cannonbolt-Fixed-Variant-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 45, nibPct: 15, loosePct: 30 },
      },
      {
        id: 'os-14',
        name: 'Wildvine',
        boxedImageUrl: require('./assets/os-Wildvine-boxed.png'),
        looseImageUrl: require('./assets/os-Wildvine-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 72, nibPct: 32, loosePct: 40 },
      },
      {
        id: 'os-15',
        name: 'Benwolf (Blitzwolfer)',
        boxedImageUrl: require('./assets/os-Benwolf (Blitzwolfer)-boxed.png'),
        looseImageUrl: require('./assets/os-Benwolf (Blitzwolfer)-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 68, nibPct: 28, loosePct: 40 },
      },
      {
        id: 'os-16',
        name: 'Upchuck',
        boxedImageUrl: require('./assets/os-Upchuck-boxed.png'),
        looseImageUrl: require('./assets/os-Upchuck-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 64, nibPct: 24, loosePct: 40 },
      },
      {
        id: 'os-17',
        name: 'Tetrax',
        boxedImageUrl: require('./assets/os-Tetrax-boxed.png'),
        looseImageUrl: require('./assets/os-Tetrax-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 55, nibPct: 20, loosePct: 35 },
      },
      {
        id: 'os-18',
        name: 'SixSix',
        boxedImageUrl: require('./assets/os-SixSix-boxed.png'),
        looseImageUrl: require('./assets/os-SixSix-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 58, nibPct: 22, loosePct: 36 },
      },
      {
        id: 'os-19',
        name: 'Vilgax',
        boxedImageUrl: require('./assets/os-Vilgax-boxed.png'),
        looseImageUrl: require('./assets/os-Vilgax-loose.png'),
        basePoints: 75,
        mockStats: { ownPct: 81, nibPct: 41, loosePct: 40 },
      },
    ],
    subsections: [
      {
        title: 'Battle version',
        figures: [
          {
            id: 'os-bv-01',
            name: 'Ben Tennyson (Battle Version)',
            boxedImageUrl: require('./assets/os-Ben Tennyson (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Ben Tennyson (Battle Version)-loose.png'),
            basePoints: 50,
            mockStats: { ownPct: 50, nibPct: 20, loosePct: 30 },
          },
          {
            id: 'os-bv-02',
            name: 'Ultra Ben (Battle Version)',
            boxedImageUrl: require('./assets/os-Ultra Ben (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Ultra Ben (Battle Version)-loose.png'),
            basePoints: 50,
            mockStats: { ownPct: 48, nibPct: 18, loosePct: 30 },
          },
          {
            id: 'os-bv-03',
            name: 'Heatblast (Battle Version)',
            boxedImageUrl: require('./assets/os-Heatblast (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Heatblast (Battle Version)-loose.png'),
            basePoints: 50,
            mockStats: { ownPct: 52, nibPct: 22, loosePct: 30 },
          },
        ],
      },
      {
        title: 'Alien Creature Series',
        figures: [
          {
            id: 'os-acs-01',
            name: 'Heatblast (Alien Creature Series)',
            boxedImageUrl: require('./assets/os-Heatblast (Alien Creature Series)-boxed.png'),
            looseImageUrl: require('./assets/os-Heatblast (Alien Creature Series)-loose.png'),
            basePoints: 100,
            mockStats: { ownPct: 40, nibPct: 15, loosePct: 25 },
          },
          {
            id: 'os-acs-02',
            name: 'Four Arms (Alien Creature Series)',
            boxedImageUrl: require('./assets/os-Four Arms (Alien Creature Series)-boxed.png'),
            looseImageUrl: require('./assets/os-Four Arms (Alien Creature Series)-loose.png'),
            basePoints: 100,
            mockStats: { ownPct: 42, nibPct: 17, loosePct: 25 },
          },
          {
            id: 'os-acs-03',
            name: 'XLR8 (Alien Creature Series)',
            boxedImageUrl: require('./assets/os-XLR8 (Alien Creature Series)-boxed.png'),
            looseImageUrl: require('./assets/os-XLR8 (Alien Creature Series)-loose.png'),
            basePoints: 100,
            mockStats: { ownPct: 38, nibPct: 13, loosePct: 25 },
          },
        ],
      },
      {
        title: 'Rides',
        figures: [
          {
            id: 'os-r-01',
            name: 'Galvan Prime Ride',
            boxedImageUrl: require('./assets/os-Galvan Prime Ride-boxed.png'),
            looseImageUrl: require('./assets/os-Galvan Prime Ride-loose.png'),
            basePoints: 200,
            mockStats: { ownPct: 30, nibPct: 10, loosePct: 20 },
          },
          {
            id: 'os-r-02',
            name: 'Tetratanker',
            boxedImageUrl: require('./assets/os-Tetratanker-boxed.png'),
            looseImageUrl: require('./assets/os-Tetratanker-loose.png'),
            basePoints: 200,
            mockStats: { ownPct: 32, nibPct: 12, loosePct: 20 },
          },
        ],
      },
      {
        title: 'Playsets',
        figures: [
          {
            id: 'os-ps-01',
            name: 'Vilgax Battle Ship',
            boxedImageUrl: require('./assets/os-Vilgax Battle Ship-boxed.png'),
            looseImageUrl: require('./assets/os-Vilgax Battle Ship-loose.png'),
            basePoints: 150,
            mockStats: { ownPct: 25, nibPct: 8, loosePct: 17 },
          },
        ],
      },
    ],
  },
  {
    id: 'alien-force',
    title: 'BEN 10: ALIEN FORCE',
    years: '2008 - 2010',
    logoUrl: require('./assets/af-logo.png'),
    backgroundUrl: require('./assets/af-bg.png'),
    colors: {
      headerGradient: ['#E6F7F9', '#F0F9FB'],
      darkStrip: '#0A181C',
      primaryText: '#00E5FF',
    },
    figures: [
      {
        id: 'af-01',
        name: 'Swampfire',
        boxedImageUrl: require('./assets/af-swampfire-boxed.png'),
        looseImageUrl: require('./assets/af-swampfire-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 86, nibPct: 50, loosePct: 36 },
      },
      {
        id: 'af-02',
        name: 'Humungousaur',
        boxedImageUrl: require('./assets/af-Humungousaur-boxed.png'),
        looseImageUrl: require('./assets/af-Humungousaur-loose.png'),
        basePoints: 50,
        mockStats: { ownPct: 89, nibPct: 49, loosePct: 40 },
      },
    ],
  },
];

const FigureCard = ({ figure, item, ownershipState, onToggleState, showPoints, t }) => {
  const { width } = useWindowDimensions();
  const isWebPC = Platform.OS === 'web' && width > 768;

  const targetItem = item || figure;

  const imageSource =
    ownershipState === 3 || ownershipState === 4
      ? targetItem.looseImageUrl
      : targetItem.boxedImageUrl;

  const earnedPoints = calculateFigurePoints(targetItem, ownershipState);

  const renderBadgeLabel = () => {
    if (ownershipState === 0 || ownershipState === 1) return t.missing;
    if (ownershipState === 2) {
      return showPoints ? `${t.newInBox}\n(+${earnedPoints} ${t.pts})` : t.newInBox;
    }
    if (ownershipState === 3) {
      return showPoints ? `${t.looseComplete}\n(+${earnedPoints} ${t.pts})` : t.looseComplete;
    }
    if (ownershipState === 4) {
      return showPoints ? `${t.looseIncomplete}\n(+${earnedPoints} ${t.pts})` : t.looseIncomplete;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggleState}
      style={[
        styles.cardContainer,
        isWebPC && styles.cardContainerWebPC,
      ]}
    >
      <View style={isWebPC ? styles.figureImageWrapperWebPC : styles.figureImageWrapper}>
        <Image
          source={imageSource}
          style={[
            styles.figureImage,
            (ownershipState === 0 || ownershipState === 1) && styles.grayscale,
          ]}
          resizeMode="contain"
        />
      </View>
      <View
        style={[
          styles.badge,
          ownershipState === 2 && styles.badgeBoxed,
          ownershipState === 3 && styles.badgeLooseComplete,
          ownershipState === 4 && styles.badgeLooseIncomplete,
        ]}
      >
        <Text style={styles.badgeText}>{renderBadgeLabel()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function App() {
  const { width } = useWindowDimensions();
  const isWebPC = Platform.OS === 'web' && width > 768;

  const [fontsLoaded] = useFonts({
    'DekoDisplay-Serial': require('./assets/DekoDisplay-Serial BoldItalic.ttf'),
  });

  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const [collectionState, setCollectionState] = useState({});
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Navigation & Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isStatsFilterOpen, setIsStatsFilterOpen] = useState(false);
  const [statsSortOrder, setStatsSortOrder] = useState('MOST_OWN');
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Profile Customization State
  const [favoriteSmoothy, setFavoriteSmoothy] = useState('Grasshopper');
  const [favoriteSeries, setFavoriteSeries] = useState('os-logo');
  const [profileFlags, setProfileFlags] = useState('🇳🇮🇺🇸');
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [isEditingFlags, setIsEditingFlags] = useState(false);

  // Auth & User Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Search state
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Language & Filter States
  const [language, setLanguage] = useState('en');
  const [showPoints, setShowPoints] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState('ALL');
  const [seriesFilter, setSeriesFilter] = useState('ALL');

  const activeSeries = LOCAL_SERIES_DATA[activeSeriesIndex];
  const scrollY = useRef(new Animated.Value(0)).current;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 1. Network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // 2. Supabase Auth listener
  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          userId: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Auth State Change Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          userId: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. App data loading
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData !== null) setCollectionState(JSON.parse(savedData));

        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang !== null) setLanguage(savedLang);

        const savedProfile = await AsyncStorage.getItem(PROFILE_DATA_KEY);
        if (savedProfile !== null) {
          const profile = JSON.parse(savedProfile);
          if (profile.favoriteSmoothy) setFavoriteSmoothy(profile.favoriteSmoothy);
          if (profile.favoriteSeries) setFavoriteSeries(profile.favoriteSeries);
          if (profile.profileFlags) setProfileFlags(profile.profileFlags);
        }
      } catch (error) {
        console.error('Failed to load local storage data:', error);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadAppData();
  }, []);

  const saveProfileData = async (smoothy, series, flags) => {
    try {
      await AsyncStorage.setItem(
        PROFILE_DATA_KEY,
        JSON.stringify({
          favoriteSmoothy: smoothy,
          favoriteSeries: series,
          profileFlags: flags,
        })
      );
    } catch (e) {
      console.error('Failed to save profile details', e);
    }
  };

  const buildLeaderboardList = async () => {
    let remoteEntries = [];
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, username, flag, score')
        .order('score', { ascending: false })
        .limit(1000);

      if (!error && data) {
        remoteEntries = data.map((item) => ({
          username: item.username,
          flag: item.flag,
          score: item.score,
        }));
      }
    } catch (e) {
      console.error('Error fetching Supabase leaderboard data:', e);
    }

    // Fallback to local user score if offline or empty
    if (remoteEntries.length === 0) {
      let activeSyncedUser = null;
      try {
        const syncData = await AsyncStorage.getItem(LEADERBOARD_SYNC_KEY);
        if (syncData) activeSyncedUser = JSON.parse(syncData);
      } catch (e) {
        console.error('Error fetching leaderboard sync data', e);
      }

      const currentScore = calculateTotalScore();
      const activeName = currentUser ? currentUser.username : (activeSyncedUser?.username || null);

      if (activeName) {
        remoteEntries = [{ username: activeName, flag: profileFlags, score: currentScore }];
      }
    }

    const slots = Array.from({ length: 1000 }, (_, index) => {
      const position = index + 1;
      const entry = remoteEntries[index];

      return {
        id: `slot-${position}`,
        position,
        username: entry ? `@${entry.username}` : '-',
        flag: entry ? entry.flag : '-',
        score: entry ? `${entry.score} PTS` : '-',
      };
    });

    setLeaderboardData(slots);
  };

  const handleOpenLeaderboard = async () => {
    setIsMenuOpen(false);
    await buildLeaderboardList();
    setIsLeaderboardOpen(true);
  };

  const handleSelectLanguage = async (selectedLang) => {
    setLanguage(selectedLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLang);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    LOCAL_SERIES_DATA.forEach((series) => {
      series.figures.forEach((figure) => {
        const state = collectionState[figure.id] || 0;
        totalScore += calculateFigurePoints(figure, state);
      });
      if (series.subsections) {
        series.subsections.forEach((sub) => {
          sub.figures.forEach((figure) => {
            const state = collectionState[figure.id] || 0;
            totalScore += calculateFigurePoints(figure, state);
          });
        });
      }
    });
    return totalScore;
  };

  const handleToggleFigure = async (figureId) => {
    const currentState = collectionState[figureId] || 0;
    const nextState = currentState >= 4 ? 1 : currentState + 1;

    const updatedCollection = {
      ...collectionState,
      [figureId]: nextState,
    };

    setCollectionState(updatedCollection);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCollection));
    } catch (error) {
      console.error('Failed to update local collection progress:', error);
    }
  };

  const handleUpdateLeaderboardScore = async () => {
    if (!currentUser) {
      Alert.alert(
        'Log In Required',
        'Your progress is saved locally on your device! To update your score on the global leaderboard, please log in to your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => setIsAuthModalOpen(true) },
        ]
      );
      return;
    }

    if (!isOnline) {
      Alert.alert(
        'Internet Connection Required',
        'You are currently offline. Your local score remains safe on your device, but an active internet connection is required to sync with the Leaderboard.'
      );
      return;
    }

    const totalScore = calculateTotalScore();
    try {
      const { error } = await supabase.from('leaderboard').upsert({
        user_id: currentUser.userId,
        username: currentUser.username,
        score: totalScore,
        flag: profileFlags,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert('Leaderboard Updated!', `Successfully updated score to ${totalScore} PTS for @${currentUser.username}.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Sync Error', 'Failed to update leaderboard score.');
    }
  };

  const handleAuthSubmit = async () => {
    setAuthErrorMessage('');

    if (!validateEmail(authEmail)) {
      setAuthErrorMessage('Please enter a valid email address.');
      return;
    }

    if (authPassword.length < 6) {
      setAuthErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      if (authMode === 'register') {
        const usernameValidation = validateUsername(authUsername);
        if (!usernameValidation.isValid) {
          setAuthErrorMessage(usernameValidation.message);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { username: authUsername.trim() },
          },
        });

        if (error) throw error;

        if (data?.user) {
          setCurrentUser({
            userId: data.user.id,
            email: data.user.email,
            username: authUsername.trim(),
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (error) throw error;

        if (data?.user) {
          const fetchedUsername = data.user.user_metadata?.username || data.user.email.split('@')[0];
          setCurrentUser({
            userId: data.user.id,
            email: data.user.email,
            username: fetchedUsername,
          });
        }
      }

      setIsAuthModalOpen(false);
      setIsProfileMenuOpen(false);
      resetAuthFields();
    } catch (error) {
      setAuthErrorMessage(error.message || 'Authentication failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (error) {
      console.error('Failed to log out:', error);
    }

    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    setIsProfileModalOpen(false);
    setIsMenuOpen(false);
    setIsFilterOpen(false);
    setIsSettingsOpen(false);
    setIsAuthModalOpen(false);
    resetAuthFields();
  };

  const resetAuthFields = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthUsername('');
    setAuthErrorMessage('');
  };

  const resetFilters = () => {
    setShowPoints(false);
    setOwnershipFilter('ALL');
    setSeriesFilter('ALL');
    setSearchQuery('');
  };

  const filterFigureList = (figures) => {
    return figures.filter((figure) => {
      const state = collectionState[figure.id] || 0;

      if (ownershipFilter === 'OWNED' && (state === 0 || state === 1)) return false;
      if (ownershipFilter === 'MISSING' && (state !== 0 && state !== 1)) return false;

      if (searchQuery.trim() !== '') {
        return figure.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      }

      return true;
    });
  };

  const getFilteredSeriesData = () => {
    return LOCAL_SERIES_DATA.filter((series) => {
      if (seriesFilter !== 'ALL' && series.id !== seriesFilter) {
        return false;
      }
      return true;
    }).map((series) => {
      const filteredMainFigures = filterFigureList(series.figures);
      const filteredSubsections = series.subsections
        ? series.subsections.map((sub) => ({
            ...sub,
            figures: filterFigureList(sub.figures),
          }))
        : [];

      return {
        ...series,
        figures: filteredMainFigures,
        subsections: filteredSubsections,
      };
    });
  };

  const allFiguresList = useMemo(() => {
    const list = [];
    LOCAL_SERIES_DATA.forEach((series) => {
      series.figures.forEach((fig) => list.push(fig));
      if (series.subsections) {
        series.subsections.forEach((sub) => {
          sub.figures.forEach((fig) => list.push(fig));
        });
      }
    });
    return list;
  }, []);

  const sortedStatsFigures = useMemo(() => {
    const sorted = [...allFiguresList];
    sorted.sort((a, b) => {
      const statsA = a.mockStats || { ownPct: 0, nibPct: 0, loosePct: 0 };
      const statsB = b.mockStats || { ownPct: 0, nibPct: 0, loosePct: 0 };

      switch (statsSortOrder) {
        case 'MOST_OWN':
          return statsB.ownPct - statsA.ownPct;
        case 'LEAST_OWN':
          return statsA.ownPct - statsB.ownPct;
        case 'MOST_NIB':
          return statsB.nibPct - statsA.nibPct;
        case 'LEAST_NIB':
          return statsA.nibPct - statsB.nibPct;
        case 'MOST_LOOSE':
          return statsB.loosePct - statsA.loosePct;
        case 'LEAST_LOOSE':
          return statsA.loosePct - statsB.loosePct;
        default:
          return statsB.ownPct - statsA.ownPct;
      }
    });
    return sorted;
  }, [allFiguresList, statsSortOrder]);

  if (!fontsLoaded || !isStorageLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  const filteredData = getFilteredSeriesData();
  const selectedSeriesObj = SERIES_LOGOS.find((s) => s.id === favoriteSeries) || SERIES_LOGOS[0];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={activeSeriesIndex === 0 ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

        {/* Dynamic Background Overlays */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {LOCAL_SERIES_DATA.map((series, index) => {
            const isLast = index === LOCAL_SERIES_DATA.length - 1;
            const prevTrigger = (index - 1) * SCREEN_HEIGHT;
            const currentTrigger = index * SCREEN_HEIGHT;
            const nextTrigger = (index + 1) * SCREEN_HEIGHT;

            const opacity = scrollY.interpolate({
              inputRange: isLast 
                ? [prevTrigger, currentTrigger] 
                : [prevTrigger, currentTrigger, nextTrigger],
              outputRange: isLast 
                ? [0, 1] 
                : [0, 1, 0],
              extrapolate: 'clamp',
            });

            return (
              <Animated.Image
                key={series.id}
                source={series.backgroundUrl}
                style={[styles.fullScreenBackground, { opacity }]}
                resizeMode="cover"
                pointerEvents="none"
              />
            );
          })}
        </View>

        {/* Top Navigation Header Bar */}
        <View style={styles.topHeaderWrapper}>
          <LinearGradient
            colors={activeSeries.colors.headerGradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.headerContentContainer}>
            {isSearchActive ? (
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t.searchPlaceholder}
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                <TouchableOpacity
                  style={styles.closeSearchButton}
                  onPress={() => {
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.closeSearchText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <Text style={[styles.iconText, { color: activeSeries.colors.darkStrip }]}>☰</Text>
                </TouchableOpacity>

                <View style={styles.logoContainer} pointerEvents="box-none">
                  <Image
                    source={activeSeries.logoUrl}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.rightActionsContainer}>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setIsSearchActive(true)}
                  >
                    <Text style={[styles.iconText, { color: activeSeries.colors.darkStrip }]}>🔍</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setIsProfileMenuOpen(true)}
                  >
                    <Text style={[styles.iconText, { color: activeSeries.colors.darkStrip }]}>👤</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Main Body Content List */}
        <View style={styles.contentBodyWrapper}>
          <Animated.FlatList
            style={styles.listFlex}
            data={filteredData}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            contentContainerStyle={styles.listContentPadding}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (event) => {
                  const yOffset = event.nativeEvent.contentOffset.y;
                  const newIndex = Math.min(
                    Math.max(0, Math.floor((yOffset + SCREEN_HEIGHT / 2) / (SCREEN_HEIGHT * 2))),
                    LOCAL_SERIES_DATA.length - 1
                  );
                  if (newIndex !== activeSeriesIndex) {
                    setActiveSeriesIndex(newIndex);
                  }
                },
              }
            )}
            scrollEventThrottle={16}
            renderItem={({ item: series }) => (
              <View style={styles.seriesSection}>
                <View style={styles.seriesTitleHeader}>
                  <Text style={[styles.seriesTitleText, { color: series.colors.primaryText }]}>
                    {series.title}
                  </Text>
                  <Text style={styles.seriesYearsText}>{series.years}</Text>
                </View>

                <View style={isWebPC && styles.webGridContainer}>
                  <FlatList
                    key={isWebPC ? 'web-grid-main' : 'mobile-grid-main'}
                    data={series.figures}
                    numColumns={isWebPC ? 11 : 3}
                    columnWrapperStyle={isWebPC ? styles.webGridRow : null}
                    renderItem={({ item }) => (
                      <FigureCard
                        item={item}
                        ownershipState={collectionState[item.id] || 0}
                        onToggleState={() => handleToggleFigure(item.id)}
                        showPoints={showPoints}
                        t={t}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ width: '100%' }}
                  />
                </View>

                {series.subsections &&
                  series.subsections.map((sub, subIndex) => (
                    <View key={subIndex} style={styles.subsectionContainer}>
                      <View style={styles.subsectionDividerContainer}>
                        <View style={styles.subsectionDividerLine} />
                        <Text style={styles.subsectionTitleText}>{sub.title}</Text>
                      </View>
                      <View style={isWebPC && styles.webGridContainer}>
                        <FlatList
                          key={isWebPC ? `web-grid-sub-${subIndex}` : `mobile-grid-sub-${subIndex}`}
                          data={sub.figures}
                          numColumns={isWebPC ? 11 : 3}
                          columnWrapperStyle={isWebPC ? styles.webGridRow : null}
                          renderItem={({ item }) => (
                            <FigureCard
                              item={item}
                              ownershipState={collectionState[item.id] || 0}
                              onToggleState={() => handleToggleFigure(item.id)}
                              showPoints={showPoints}
                              t={t}
                            />
                          )}
                          keyExtractor={(item) => item.id}
                          contentContainerStyle={{ width: '100%' }}
                        />
                      </View>
                    </View>
                  ))}
              </View>
            )}
          />
        </View>

        {/* Total Score Footer Bar */}
        {showPoints && (
          <SafeAreaView edges={['bottom']} style={styles.scoreFooterSafeArea}>
            <View style={styles.scoreFooter}>
              <Text style={styles.scoreFooterLabel}>{t.collectorScore}</Text>
              <Text style={styles.scoreFooterValue}>{calculateTotalScore()} {t.pts}</Text>
            </View>
          </SafeAreaView>
        )}

        {/* Profile Details Window Modal */}
        <Modal
          visible={isProfileModalOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsProfileModalOpen(false)}
        >
          <SafeAreaView style={styles.publicProfileContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.publicProfileHeader}>
              <TouchableOpacity
                style={styles.publicProfileCloseButton}
                onPress={() => setIsProfileModalOpen(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text style={styles.publicProfileCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.publicProfileBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.profileModalMainTitle}>{t.profileTitle}</Text>

              <Text style={styles.profileModalUsername}>
                {currentUser ? currentUser.username : 'Guardabarranco'}
              </Text>

              <Text style={styles.profileModalUserId}>
                #{currentUser ? currentUser.userId : 'USR-773921'}
              </Text>

              <Text style={styles.profileModalSubHeader}>{t.fromLivesIn}</Text>
              <View style={styles.flagRowContainer}>
                <Text style={styles.flagEmojiText}>{profileFlags}</Text>
                {currentUser && (
                  <TouchableOpacity
                    style={styles.pencilIconButton}
                    onPress={() => setIsEditingFlags(!isEditingFlags)}
                  >
                    <Text style={styles.pencilIconText}>✏️</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingFlags && currentUser && (
                <View style={styles.flagPickerDropdown}>
                  {FLAG_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={styles.flagOptionItem}
                      onPress={() => {
                        setProfileFlags(opt.value);
                        saveProfileData(favoriteSmoothy, favoriteSeries, opt.value);
                        setIsEditingFlags(false);
                      }}
                    >
                      <Text style={styles.flagOptionText}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.profileTwoColumnRow}>
                {/* Favorite Smoothy Box */}
                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.favoriteSmoothy}</Text>
                  <TextInput
                    style={styles.smoothyInputText}
                    value={favoriteSmoothy}
                    onChangeText={(val) => {
                      setFavoriteSmoothy(val);
                      saveProfileData(val, favoriteSeries, profileFlags);
                    }}
                    placeholder="Enter flavor"
                    placeholderTextColor="#888"
                    editable={!!currentUser}
                  />
                  {currentUser && (
                    <View style={styles.boxPencilPosition}>
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </View>
                  )}
                </View>

                {/* Favorite Series Box */}
                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.favoriteSeries}</Text>
                  <TouchableOpacity
                    style={styles.seriesLogoSelectArea}
                    onPress={() => {
                      if (currentUser) setIsEditingSeries(!isEditingSeries);
                    }}
                    activeOpacity={currentUser ? 0.7 : 1}
                  >
                    <Image
                      source={selectedSeriesObj.image}
                      style={styles.seriesLogoPreview}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  {currentUser && (
                    <TouchableOpacity
                      style={styles.boxPencilPosition}
                      onPress={() => setIsEditingSeries(!isEditingSeries)}
                    >
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Series Picker Dropdown Menu */}
              {isEditingSeries && currentUser && (
                <View style={styles.seriesPickerContainer}>
                  {SERIES_LOGOS.map((logoItem) => (
                    <TouchableOpacity
                      key={logoItem.id}
                      style={[
                        styles.seriesPickerItem,
                        favoriteSeries === logoItem.id && styles.seriesPickerItemActive,
                      ]}
                      onPress={() => {
                        setFavoriteSeries(logoItem.id);
                        saveProfileData(favoriteSmoothy, logoItem.id, profileFlags);
                        setIsEditingSeries(false);
                      }}
                    >
                      <Image source={logoItem.image} style={styles.seriesPickerLogo} resizeMode="contain" />
                      <Text style={styles.seriesPickerLabel}>{logoItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Collector Score Center Box */}
              <View style={styles.collectorScoreCenterBox}>
                <Text style={styles.collectorScoreBoxTitle}>{t.collectorScore}</Text>
                <View style={styles.scoreValueHighlightBox}>
                  <Text style={styles.scoreValueHighlightText}>{calculateTotalScore()}</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Stats Modal */}
        <Modal
          visible={isStatsOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsStatsOpen(false)}
        >
          <SafeAreaView style={styles.statsModalContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.statsHeader}>
              <TouchableOpacity
                style={styles.statsFilterIconButton}
                onPress={() => setIsStatsFilterOpen(true)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Text style={styles.statsFilterIconText}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.statsHeaderTitle}>{t.statsPageTitle}</Text>

              <TouchableOpacity
                style={styles.statsCloseButton}
                onPress={() => setIsStatsOpen(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                activeOpacity={0.7}
              >
                <Text style={styles.statsCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.statsScroll}
              contentContainerStyle={styles.statsGridContent}
              showsVerticalScrollIndicator={false}
            >
              {sortedStatsFigures.map((item, index) => {
                const stats = item.mockStats || { ownPct: 50, nibPct: 50, loosePct: 30 };

                return (
                  <View key={item.id} style={styles.statsCardBox}>
                    <View style={styles.statsNumberBadge}>
                      <Text style={styles.statsNumberBadgeText}>{index + 1}</Text>
                    </View>

                    <View style={styles.statsCardInnerRow}>
                      <Image
                        source={item.looseImageUrl}
                        style={styles.statsLooseImage}
                        resizeMode="contain"
                      />

                      <View style={styles.statsDetailsColumn}>
                        <Text style={styles.statsPctOwnText}>{stats.ownPct}% Own it</Text>
                        <Text style={styles.statsPctSubText}>{stats.nibPct}% NIB</Text>
                        <Text style={styles.statsPctSubText}>{stats.loosePct}% Loose</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Stats Filter Modal */}
        <Modal
          visible={isStatsFilterOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsStatsFilterOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsStatsFilterOpen(false)}>
            <View style={styles.filterModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.filterCard}>
                  <Text style={styles.filterTitle}>{t.statsSortTitle}</Text>

                  <View style={styles.filterOptionGroupVertical}>
                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'MOST_OWN' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('MOST_OWN');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.mostOwnedToLeast}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'LEAST_OWN' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('LEAST_OWN');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.leastOwnedToMost}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'MOST_NIB' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('MOST_NIB');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.mostNibToLeast}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'LEAST_NIB' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('LEAST_NIB');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.leastNibToMost}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'MOST_LOOSE' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('MOST_LOOSE');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.mostLooseToLeast}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterChipVertical,
                        statsSortOrder === 'LEAST_LOOSE' && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setStatsSortOrder('LEAST_LOOSE');
                        setIsStatsFilterOpen(false);
                      }}
                    >
                      <Text style={styles.filterChipText}>{t.leastLooseToMost}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={[styles.closeButton, { alignSelf: 'center', marginTop: 8 }]}
                    onPress={() => setIsStatsFilterOpen(false)}
                  >
                    <Text style={styles.closeButtonText}>{t.done}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          visible={isLeaderboardOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsLeaderboardOpen(false)}
        >
          <SafeAreaView style={styles.newsModalContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.newsHeader}>
              <View style={styles.newsHeaderBadge}>
                <Text style={styles.newsHeaderTitle}>{t.leaderboardTitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.newsCloseButton}
                onPress={() => setIsLeaderboardOpen(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                activeOpacity={0.7}
              >
                <Text style={styles.newsCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.leaderboardTableHeader}>
              <Text style={[styles.leaderboardHeaderCell, styles.rankCol]}>{t.rank}</Text>
              <Text style={[styles.leaderboardHeaderCell, styles.userCol]}>{t.user}</Text>
              <Text style={[styles.leaderboardHeaderCell, styles.flagCol]}>{t.flag}</Text>
              <Text style={[styles.leaderboardHeaderCell, styles.scoreCol]}>{t.score}</Text>
            </View>

            <FlatList
              style={styles.newsScroll}
              data={leaderboardData}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.leaderboardListPadding}
              renderItem={({ item }) => (
                <View style={styles.leaderboardRow}>
                  <Text style={[styles.leaderboardCell, styles.rankCol]}>#{item.position}</Text>
                  <Text style={[styles.leaderboardCell, styles.userCol]} numberOfLines={1}>
                    {item.username}
                  </Text>
                  <Text style={[styles.leaderboardCell, styles.flagCol]}>{item.flag}</Text>
                  <Text style={[styles.leaderboardCell, styles.scoreCol]}>{item.score}</Text>
                </View>
              )}
            />
          </SafeAreaView>
        </Modal>

        {/* News Modal */}
        <Modal
          visible={isNewsOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsNewsOpen(false)}
        >
          <SafeAreaView style={styles.newsModalContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.newsHeader}>
              <View style={styles.newsHeaderBadge}>
                <Text style={styles.newsHeaderTitle}>{t.newsTitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.newsCloseButton}
                onPress={() => setIsNewsOpen(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                activeOpacity={0.7}
              >
                <Text style={styles.newsCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.newsScroll} contentContainerStyle={styles.newsScrollContent} showsVerticalScrollIndicator={false}>
              {NEWS_ITEMS.map((item) => (
                <View key={item.id} style={styles.newsCard}>
                  <Image source={{ uri: item.imageUri }} style={styles.newsCardImage} resizeMode="cover" />
                  <View style={styles.newsCardDetails}>
                    <Text style={styles.newsCategory}>{item.category.toUpperCase()}</Text>
                    <Text style={styles.newsCardTitle}>{item.title}</Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Profile Menu Modal */}
        <Modal
          visible={isProfileMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsProfileMenuOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsProfileMenuOpen(false)}>
            <View style={styles.profileModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.profileMenuCard}>
                  {currentUser ? (
                    <View style={styles.userBanner}>
                      <Text style={styles.userBannerTitle}>Logged in as:</Text>
                      <Text style={styles.userBannerName}>@{currentUser.username}</Text>
                      <Text style={styles.userIdText}>
                        {t.userIdLabel}: {currentUser.userId}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.userBannerOffline}>
                      <Text style={styles.userBannerTitle}>Offline Mode</Text>
                      <Text style={styles.userBannerSub}>Progress saved locally</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsProfileMenuOpen(false);
                      if (!currentUser) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsProfileModalOpen(true);
                      }
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>👤</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>
                      {currentUser ? t.myProfile : `${t.login} / ${t.register}`}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsProfileMenuOpen(false);
                      handleUpdateLeaderboardScore();
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>🌐</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{t.syncLeaderboard}</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsProfileMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>⚙</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{t.settings}</Text>
                  </TouchableOpacity>

                  {currentUser && (
                    <>
                      <View style={styles.menuDivider} />

                      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuIconBox}>
                          <Text style={styles.menuIconText}>🚪</Text>
                        </View>
                        <Text style={styles.menuItemLabel}>{t.logout}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Auth Modal */}
        <Modal
          visible={isAuthModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setIsAuthModalOpen(false);
            resetAuthFields();
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setIsAuthModalOpen(false);
              resetAuthFields();
            }}
          >
            <View style={styles.filterModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.filterCard}>
                  <View style={styles.authTabGroup}>
                    <TouchableOpacity
                      style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
                      onPress={() => {
                        setAuthMode('login');
                        setAuthErrorMessage('');
                      }}
                    >
                      <Text style={styles.authTabText}>{t.login}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.authTab, authMode === 'register' && styles.authTabActive]}
                      onPress={() => {
                        setAuthMode('register');
                        setAuthErrorMessage('');
                      }}
                    >
                      <Text style={styles.authTabText}>{t.register}</Text>
                    </TouchableOpacity>
                  </View>

                  {authErrorMessage !== '' && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{authErrorMessage}</Text>
                    </View>
                  )}

                  <Text style={styles.inputLabel}>{t.email}:</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="e.g. user@gmail.com, user@yahoo.com"
                    placeholderTextColor="#888"
                    value={authEmail}
                    onChangeText={setAuthEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>{t.password}:</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="••••••••"
                    placeholderTextColor="#888"
                    value={authPassword}
                    onChangeText={setAuthPassword}
                    secureTextEntry={true}
                  />

                  {authMode === 'register' && (
                    <>
                      <Text style={styles.inputLabel}>{t.username}:</Text>
                      <TextInput
                        style={styles.authInput}
                        placeholder="e.g. AlienCollector99"
                        placeholderTextColor="#888"
                        value={authUsername}
                        onChangeText={setAuthUsername}
                        autoCapitalize="none"
                      />
                    </>
                  )}

                  <TouchableOpacity style={styles.submitAuthButton} onPress={handleAuthSubmit}>
                    <Text style={styles.submitAuthText}>
                      {authMode === 'login' ? t.login : t.register}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.closeButton, { alignSelf: 'center', marginTop: 8 }]}
                    onPress={() => {
                      setIsAuthModalOpen(false);
                      resetAuthFields();
                    }}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Settings Modal */}
        <Modal
          visible={isSettingsOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsSettingsOpen(false)}>
            <View style={styles.filterModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.filterCard}>
                  <Text style={styles.filterTitle}>{t.settings}</Text>
                  <Text style={styles.filterSectionHeader}>{t.selectLanguage}:</Text>

                  <View style={styles.filterOptionGroupVertical}>
                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'en' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('en')}
                    >
                      <Text style={styles.filterChipText}>English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'es' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('es')}
                    >
                      <Text style={styles.filterChipText}>Español</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={[styles.closeButton, { alignSelf: 'center', marginTop: 8 }]}
                    onPress={() => setIsSettingsOpen(false)}
                  >
                    <Text style={styles.closeButtonText}>{t.done}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Menu Drawer Modal */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.menuCard}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsNewsOpen(true);
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>📰</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{t.news}</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={handleOpenLeaderboard}>
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>🏆</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{t.leaderboards}</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsStatsOpen(true);
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>%</Text>
                    </View>
                    <Text style={[styles.menuItemLabel, { fontFamily: 'DekoDisplay-Serial', fontSize: 18 }]}>
                      {t.stats}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setIsFilterOpen(true);
                    }}
                  >
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIconText}>🎛</Text>
                    </View>
                    <Text style={styles.menuItemLabel}>{t.filter}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={isFilterOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsFilterOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsFilterOpen(false)}>
            <View style={styles.filterModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.filterCard}>
                  <Text style={styles.filterTitle}>{t.filterOptions}</Text>

                  <TouchableOpacity
                    style={styles.filterRow}
                    onPress={() => setShowPoints(!showPoints)}
                  >
                    <Text style={styles.filterRowLabel}>{t.showPointsScore}</Text>
                    <Text style={styles.filterToggleValue}>{showPoints ? '[ ON ]' : '[ OFF ]'}</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <Text style={styles.filterSectionHeader}>{t.filterBySeries}</Text>
                  <View style={styles.filterOptionGroupVertical}>
                    <TouchableOpacity
                      style={[styles.filterChipVertical, seriesFilter === 'ALL' && styles.filterChipActive]}
                      onPress={() => setSeriesFilter('ALL')}
                    >
                      <Text style={styles.filterChipText}>{t.allSeries}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, seriesFilter === 'original-series' && styles.filterChipActive]}
                      onPress={() => setSeriesFilter('original-series')}
                    >
                      <Text style={styles.filterChipText}>{t.osSeries}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, seriesFilter === 'alien-force' && styles.filterChipActive]}
                      onPress={() => setSeriesFilter('alien-force')}
                    >
                      <Text style={styles.filterChipText}>{t.afSeries}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.menuDivider} />

                  <Text style={styles.filterSectionHeader}>{t.displayFigures}</Text>
                  <View style={styles.filterOptionGroup}>
                    <TouchableOpacity
                      style={[styles.filterChip, ownershipFilter === 'ALL' && styles.filterChipActive]}
                      onPress={() => setOwnershipFilter('ALL')}
                    >
                      <Text style={styles.filterChipText}>{t.all}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChip, ownershipFilter === 'OWNED' && styles.filterChipActive]}
                      onPress={() => setOwnershipFilter('OWNED')}
                    >
                      <Text style={styles.filterChipText}>{t.ownedOnly}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChip, ownershipFilter === 'MISSING' && styles.filterChipActive]}
                      onPress={() => setOwnershipFilter('MISSING')}
                    >
                      <Text style={styles.filterChipText}>{t.missingOnly}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.menuDivider} />

                  <View style={styles.filterFooterActionRow}>
                    <TouchableOpacity style={styles.resetFilterBtn} onPress={resetFilters}>
                      <Text style={styles.resetFilterText}>{t.resetFilters}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsFilterOpen(false)}>
                      <Text style={styles.closeButtonText}>{t.done}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenBackground: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topHeaderWrapper: {
    height: 60,
    width: '100%',
    zIndex: 100,
    elevation: 10,
    justifyContent: 'center',
  },
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
    position: 'relative',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  iconText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 38,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  closeSearchButton: {
    padding: 4,
  },
  closeSearchText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  contentBodyWrapper: {
    flex: 1,
    zIndex: 10,
  },
  listFlex: {
    flex: 1,
  },
  listContentPadding: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  seriesSection: {
    marginBottom: 40,
    paddingHorizontal: GRID_PADDING,
  },
  seriesTitleHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  seriesTitleText: {
    fontFamily: 'DekoDisplay-Serial',
    fontSize: 26,
    letterSpacing: 1,
  },
  seriesYearsText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  subsectionContainer: {
    marginTop: 24,
  },
  subsectionDividerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subsectionDividerLine: {
    width: '85%',
    height: 6,
    backgroundColor: '#888888',
    borderRadius: 3,
    marginBottom: 12,
  },
  subsectionTitleText: {
    fontSize: 20,
    color: '#888888',
  },
  scoreFooterSafeArea: {
    backgroundColor: '#0F172A',
    zIndex: 100,
    elevation: 10,
  },
  scoreFooter: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  scoreFooterLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreFooterValue: {
    color: '#39FF14',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingLeft: 16,
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingRight: 16,
  },
  menuCard: {
    width: 220,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  profileMenuCard: {
    width: 240,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  userBanner: {
    backgroundColor: '#0F172A',
    padding: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userBannerTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  userBannerName: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  userIdText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  userBannerOffline: {
    backgroundColor: '#0F172A',
    padding: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userBannerSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIconBox: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuItemLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContainerWebPC: {
    width: 120,
    maxHeight: 180,
    aspectRatio: 1 / 1.5,
    alignSelf: 'center',
    flexGrow: 0,
    flexShrink: 0,
  },
  figureImageWrapper: {
    width: '100%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  figureImageWrapperWebPC: {
    width: '100%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  figureImage: {
    width: '100%',
    height: '100%',
  },
  grayscale: {
    opacity: 0.35,
  },
  badge: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeBoxed: {
    backgroundColor: '#16A34A',
  },
  badgeLooseComplete: {
    backgroundColor: '#2563EB',
  },
  badgeLooseIncomplete: {
    backgroundColor: '#D97706',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webGridContainer: {
    alignItems: 'center',
  },
  webGridRow: {
    justifyContent: 'flex-start',
    gap: 8,
    marginVertical: 4,
  },
  publicProfileContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  publicProfileHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  publicProfileCloseButton: {
    padding: 8,
  },
  publicProfileCloseText: {
    color: '#94A3B8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  publicProfileBody: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  profileModalMainTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  profileModalUsername: {
    color: '#38BDF8',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileModalUserId: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  profileModalSubHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  flagRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  flagEmojiText: {
    fontSize: 24,
  },
  pencilIconButton: {
    padding: 4,
  },
  pencilIconText: {
    fontSize: 14,
  },
  flagPickerDropdown: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    width: '100%',
  },
  flagOptionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  flagOptionText: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  profileTwoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginVertical: 16,
  },
  profileBoxCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  profileBoxTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  smoothyInputText: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 0,
  },
  boxPencilPosition: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  seriesLogoSelectArea: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seriesLogoPreview: {
    width: '100%',
    height: '100%',
  },
  seriesPickerContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    marginBottom: 16,
  },
  seriesPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
  },
  seriesPickerItemActive: {
    backgroundColor: '#334155',
  },
  seriesPickerLogo: {
    width: 30,
    height: 20,
    marginRight: 12,
  },
  seriesPickerLabel: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  collectorScoreCenterBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  collectorScoreBoxTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValueHighlightBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#39FF14',
  },
  scoreValueHighlightText: {
    color: '#39FF14',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsModalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statsFilterIconButton: {
    padding: 6,
  },
  statsFilterIconText: {
    color: '#38BDF8',
    fontSize: 16,
  },
  statsHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsCloseButton: {
    padding: 6,
  },
  statsCloseButtonText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsScroll: {
    flex: 1,
  },
  statsGridContent: {
    padding: 16,
    gap: 12,
  },
  statsCardBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  statsNumberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#334155',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsNumberBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsCardInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 20,
  },
  statsLooseImage: {
    width: 60,
    height: 60,
  },
  statsDetailsColumn: {
    justifyContent: 'center',
  },
  statsPctOwnText: {
    color: '#39FF14',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsPctSubText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  newsModalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  newsHeaderBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newsHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  newsCloseButton: {
    padding: 6,
  },
  newsCloseButtonText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newsScroll: {
    flex: 1,
  },
  newsScrollContent: {
    padding: 16,
    gap: 16,
  },
  newsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  newsCardImage: {
    width: '100%',
    height: 140,
  },
  newsCardDetails: {
    padding: 12,
  },
  newsCategory: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  newsCardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  newsDate: {
    color: '#64748B',
    fontSize: 10,
  },
  leaderboardTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  leaderboardHeaderCell: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  leaderboardListPadding: {
    paddingVertical: 8,
  },
  leaderboardRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
    alignItems: 'center',
  },
  leaderboardCell: {
    color: '#F8FAFC',
    fontSize: 13,
  },
  rankCol: {
    width: '18%',
  },
  userCol: {
    width: '42%',
    fontWeight: '600',
  },
  flagCol: {
    width: '18%',
    textAlign: 'center',
  },
  scoreCol: {
    width: '22%',
    textAlign: 'right',
    color: '#39FF14',
    fontWeight: 'bold',
  },
  filterCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterRowLabel: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  filterToggleValue: {
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  filterSectionHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  filterOptionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOptionGroupVertical: {
    gap: 8,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipVertical: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  filterChipText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  filterFooterActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  resetFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resetFilterText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  authTabGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
  },
  authTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  authTabActive: {
    backgroundColor: '#38BDF8',
  },
  authTabText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  authInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  submitAuthButton: {
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  submitAuthText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
});