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
const SUPABASE_URL = 'https://wridtdrfuffnncfxebto.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3ZnS-DzUGj3QSn4mi4aIPw_pMfszRxW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const STORAGE_KEY = '@ben10_user_collection';
const LANGUAGE_STORAGE_KEY = '@ben10_user_language';
const USER_SESSION_KEY = '@ben10_active_user';
const LEADERBOARD_SYNC_KEY = '@ben10_leaderboard_score';
const PROFILE_DATA_KEY = '@ben10_user_profile_data';

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

const AVAILABLE_FLAGS = [
  { label: 'None', value: '' },
  { label: '🇹🇼 Taiwan', value: '🇹🇼' },
  { label: '🇰🇷 South Korea', value: '🇰🇷' },
  { label: '🇨🇳 China', value: '🇨🇳' },
  { label: '🇯🇵 Japan', value: '🇯🇵' },
  { label: '🇺🇸 United States', value: '🇺🇸' },
  { label: '🇨🇦 Canada', value: '🇨🇦' },
  { label: '🇲🇽 Mexico', value: '🇲🇽' },
  { label: '🇧🇿 Belize', value: '🇧🇿' },
  { label: '🇨🇷 Costa Rica', value: '🇨🇷' },
  { label: '🇸🇻 El Salvador', value: '🇸🇻' },
  { label: '🇬🇹 Guatemala', value: '🇬🇹' },
  { label: '🇭🇳 Honduras', value: '🇭🇳' },
  { label: '🇳🇮 Nicaragua', value: '🇳🇮' },
  { label: '🇵🇦 Panama', value: '🇵🇦' },
  { label: '🇦🇷 Argentina', value: '🇦🇷' },
  { label: '🇧🇴 Bolivia', value: '🇧🇴' },
  { label: '🇧🇷 Brazil', value: '🇧🇷' },
  { label: '🇨🇱 Chile', value: '🇨🇱' },
  { label: '🇨🇴 Colombia', value: '🇨🇴' },
  { label: '🇪🇨 Ecuador', value: '🇪🇨' },
  { label: '🇬🇾 Guyana', value: '🇬🇾' },
  { label: '🇵🇾 Paraguay', value: '🇵🇾' },
  { label: '🇵🇪 Peru', value: '🇵🇪' },
  { label: '🇸🇷 Suriname', value: '🇸🇷' },
  { label: '🇺🇾 Uruguay', value: '🇺🇾' },
  { label: '🇻🇪 Venezuela', value: '🇻🇪' },
  { label: '🇬🇧 United Kingdom', value: '🇬🇧' },
  { label: '🇩🇪 Germany', value: '🇩🇪' },
  { label: '🇹🇷 Turkey', value: '🇹🇷' },
  { label: '🇵🇭 Philippines', value: '🇵🇭' },
  { label: '🇪🇸 Spain', value: '🇪🇸' },
  { label: '🇫🇷 France', value: '🇫🇷' },
  { label: '🇮🇹 Italy', value: '🇮🇹' },
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
    favoriteFigure: 'Favorite Figure',
    collection: 'Collection',
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
    favoriteFigure: 'Figura Favorita',
    collection: 'Colección',
  },
  pt: {
    news: 'Notícias',
    leaderboards: 'Classificação',
    stats: 'Estatísticas',
    filter: 'Filtro',
    myProfile: 'Meu Perfil',
    settings: 'Configurações',
    logout: 'Sair',
    login: 'Entrar',
    register: 'Registrar',
    email: 'E-mail',
    password: 'Senha',
    username: 'Nome de Usuário',
    filterOptions: 'Opções de Filtro',
    showPointsScore: 'Mostrar Pontos e Pontuação',
    filterBySeries: 'Filtrar por Série:',
    allSeries: 'Todas as Séries',
    osSeries: 'Série Original (2006-2007)',
    afSeries: 'Alien Force (2008-2010)',
    displayFigures: 'Exibir Figuras:',
    all: 'Todas',
    ownedOnly: 'Somente Adquiridos',
    missingOnly: 'Somente Ausentes',
    resetFilters: 'Redefinir Filtros',
    done: 'Concluído',
    collectorScore: 'PONTUAÇÃO DE COLECIONADOR',
    pts: 'PTS',
    missing: 'FALTANDO',
    newInBox: 'NOVO NA CAIXA',
    looseComplete: 'LOOSE - COMPLETO',
    looseIncomplete: 'LOOSE - INCOMPLETO',
    selectLanguage: 'Selecionar Idioma',
    searchPlaceholder: 'Buscar figuras em todas as séries...',
    syncLeaderboard: 'Atualizar Pontuação',
    newsTitle: 'NOTÍCIAS E ATUALIZAÇÕES',
    leaderboardTitle: 'PRINCIPAIS COLECIONADORES',
    statsPageTitle: 'Página de Estatísticas',
    statsSortTitle: 'Ordenar Estatísticas',
    mostOwnedToLeast: 'Mais adquiridos para menos',
    leastOwnedToMost: 'Menos adquiridos para mais',
    mostNibToLeast: 'Mais adquiridos (Novo) para menos',
    leastNibToMost: 'Menos adquiridos (Novo) para mais',
    mostLooseToLeast: 'Mais adquiridos (Loose) para menos',
    leastLooseToMost: 'Menos adquiridos (Loose) para mais',
    rank: 'POS',
    user: 'USUÁRIO',
    flag: 'BANDEIRA',
    score: 'PONTOS',
    userIdLabel: 'ID de Usuário',
    profileTitle: 'Perfil',
    fromLivesIn: 'De/Mora em',
    favoriteSmoothy: 'Smoothy Favorito',
    favoriteSeries: 'Série Favorita',
    favoriteFigure: 'Figura Favorita',
    collection: 'Coleção',
  },
  th: {
    news: 'ข่าวสาร',
    leaderboards: 'ตารางคะแนน',
    stats: 'สถิติ',
    filter: 'ตัวกรอง',
    myProfile: 'โปรไฟล์ของฉัน',
    settings: 'ตั้งค่า',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    register: 'ลงทะเบียน',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    username: 'ชื่อผู้ใช้',
    filterOptions: 'ตัวเลือกตัวกรอง',
    showPointsScore: 'แสดงคะแนน',
    filterBySeries: 'กรองตามซีรีส์:',
    allSeries: 'ซีรีส์ทั้งหมด',
    osSeries: 'ออริจินัลซีรีส์ (2006-2007)',
    afSeries: 'เอเลี่ยนฟอร์ซ (2008-2010)',
    displayFigures: 'แสดงฟิกเกอร์:',
    all: 'ทั้งหมด',
    ownedOnly: 'ที่มีอยู่',
    missingOnly: 'ที่ยังไม่มี',
    resetFilters: 'รีเซ็ตตัวกรอง',
    done: 'เสร็จสิ้น',
    collectorScore: 'คะแนนนักสะสม',
    pts: 'คะแนน',
    missing: 'ยังไม่มี',
    newInBox: 'ใหม่ในกล่อง',
    looseComplete: 'มือสอง - สมบูรณ์',
    looseIncomplete: 'มือสอง - ไม่สมบูรณ์',
    selectLanguage: 'เลือกภาษา',
    searchPlaceholder: 'ค้นหาฟิกเกอร์ในทุกซีรีส์...',
    syncLeaderboard: 'อัปเดตคะแนนลีดเดอร์บอร์ด',
    newsTitle: 'ข่าวสารและอัปเดต',
    leaderboardTitle: 'นักสะสมชั้นนำ',
    statsPageTitle: 'หน้าสถิติ',
    statsSortTitle: 'จัดเรียงสถิติ',
    mostOwnedToLeast: 'มีมากที่สุดไปน้อยที่สุด',
    leastOwnedToMost: 'มีน้อยที่สุดไปมากที่สุด',
    mostNibToLeast: 'ของใหม่มากที่สุดไปน้อยที่สุด',
    leastNibToMost: 'ของใหม่น้อยที่สุดไปมากที่สุด',
    mostLooseToLeast: 'แกะแล้วมากที่สุดไปน้อยที่สุด',
    leastLooseToMost: 'แกะแล้วน้อยที่สุดไปมากที่สุด',
    rank: 'อันดับ',
    user: 'ผู้ใช้',
    flag: 'ธง',
    score: 'คะแนน',
    userIdLabel: 'รหัสผู้ใช้',
    profileTitle: 'โปรไฟล์',
    fromLivesIn: 'มาจาก/อาศัยอยู่ที่',
    favoriteSmoothy: 'สการ์เร็ต สมูทตี้โปรด',
    favoriteSeries: 'ซีรีส์โปรด',
    favoriteFigure: 'ฟิกเกอร์โปรด',
    collection: 'คอลเลกชัน',
  },
  hi: {
    news: 'समाचार',
    leaderboards: 'लीडरबोर्ड',
    stats: 'आंकड़े',
    filter: 'फ़िल्टर',
    myProfile: 'मेरी प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    register: 'पंजीकरण करें',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    username: 'उपयोगकर्ता नाम',
    filterOptions: 'फ़िल्टर विकल्प',
    showPointsScore: 'अंक और स्कोर दिखाएं',
    filterBySeries: 'श्रृंखला द्वारा फ़िल्टर करें:',
    allSeries: 'सभी श्रृंखलाएं',
    osSeries: 'मूल श्रृंखला (2006-2007)',
    afSeries: 'एलियन फोर्स (2008-2010)',
    displayFigures: 'चित्र दिखाएं:',
    all: 'सभी',
    ownedOnly: 'केवल स्वामित्व वाले',
    missingOnly: 'केवल गायब',
    resetFilters: 'फ़िल्टर रीसेट करें',
    done: 'हो गया',
    collectorScore: 'कलेक्टर स्कोर',
    pts: 'अंक',
    missing: 'गायब',
    newInBox: 'डिब्बे में नया',
    looseComplete: 'खुला - पूर्ण',
    looseIncomplete: 'खुला - अधूरा',
    selectLanguage: 'भाषा चुनें',
    searchPlaceholder: 'सभी श्रृंखलाओं में खोजें...',
    syncLeaderboard: 'लीडरबोर्ड स्कोर अपडेट करें',
    newsTitle: 'समाचार और अपडेट',
    leaderboardTitle: 'शीर्ष संग्राहक',
    statsPageTitle: 'आंकड़े पृष्ठ',
    statsSortTitle: 'आंकड़े क्रमबद्ध करें',
    mostOwnedToLeast: 'सबसे अधिक से सबसे कम स्वामित्व',
    leastOwnedToMost: 'सबसे कम से सबसे अधिक स्वामित्व',
    mostNibToLeast: 'सबसे नया (बॉक्स में) से कम',
    leastNibToMost: 'सबसे कम (बॉक्स में) से अधिक',
    mostLooseToLeast: 'सबसे अधिक खुला से कम',
    leastLooseToMost: 'सबसे कम खुला से अधिक',
    rank: 'रैंक',
    user: 'उपयोगकर्ता',
    flag: 'ध्वज',
    score: 'स्कोर',
    userIdLabel: 'उपयोगकर्ता आईडी',
    profileTitle: 'प्रोफ़ाइल',
    fromLivesIn: 'से / में रहता है',
    favoriteSmoothy: 'पसंदीदा स्मूदी',
    favoriteSeries: 'पसंदीदा श्रृंखला',
    favoriteFigure: 'पसंदीदा फ़िगर',
    collection: 'संग्रह',
  },
  zh: {
    news: '新闻',
    leaderboards: '排行榜',
    stats: '统计',
    filter: '筛选',
    myProfile: '我的个人资料',
    settings: '设置',
    logout: '退出登录',
    login: '登录',
    register: '注册',
    email: '电子邮件地址',
    password: '密码',
    username: '用户名',
    filterOptions: '筛选选项',
    showPointsScore: '显示积分与分数',
    filterBySeries: '按系列筛选：',
    allSeries: '所有系列',
    osSeries: '初代系列 (2006-2007)',
    afSeries: '外星英雄 (2008-2010)',
    displayFigures: '显示手办：',
    all: '全部',
    ownedOnly: '仅已拥有',
    missingOnly: '仅未拥有',
    resetFilters: '重置筛选',
    done: '完成',
    collectorScore: '收藏家积分',
    pts: '分',
    missing: '未拥有',
    newInBox: '全新未拆',
    looseComplete: '散货 - 完整',
    looseIncomplete: '散货 - 缺失',
    selectLanguage: '选择语言',
    searchPlaceholder: '搜索跨系列手办...',
    syncLeaderboard: '更新排行榜分数',
    newsTitle: '新闻与更新',
    leaderboardTitle: '顶尖收藏家',
    statsPageTitle: '统计页面',
    statsSortTitle: '排序统计',
    mostOwnedToLeast: '拥有拥有最多到最少',
    leastOwnedToMost: '拥有最少到最多',
    mostNibToLeast: '全新未拆最多到最少',
    leastNibToMost: '全新未拆最少到最多',
    mostLooseToLeast: '散货最多到最少',
    leastLooseToMost: '散货最少到最多',
    rank: '排名',
    user: '用户',
    flag: '旗帜',
    score: '分数',
    userIdLabel: '用户 ID',
    profileTitle: '个人资料',
    fromLivesIn: '来自 / 居住于',
    favoriteSmoothy: '最喜欢的冰沙',
    favoriteSeries: '最喜欢的系列',
    favoriteFigure: '最喜欢的手办',
    collection: '收藏',
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

const hasLooseStates = (figure) => {
  if (!figure) return true;
  const lc = figure.LooseCompleteWorth;
  const li = figure.LooseIncompleteWorth;
  if (lc === 'None' || lc === false || li === 'None' || li === false) {
    return false;
  }
  return true;
};

export const calculateFigurePoints = (figure, state) => {
  if (!state || state === 0 || state === 1) return 0;
  const base = figure.basePoints || 50;
  if (state === 2) {
    return figure.NewInBoxWorth !== undefined ? figure.NewInBoxWorth : base * 2.0;
  }
  if (state === 3) {
    if (figure.LooseCompleteWorth === 'None' || figure.LooseCompleteWorth === false) return 0;
    return figure.LooseCompleteWorth !== undefined ? figure.LooseCompleteWorth : base * 1.0;
  }
  if (state === 4) {
    if (figure.LooseIncompleteWorth === 'None' || figure.LooseIncompleteWorth === false) return 0;
    return figure.LooseIncompleteWorth !== undefined ? figure.LooseIncompleteWorth : base * 0.5;
  }
  return 0;
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
      },
      {
        id: 'os-02',
        name: 'Heatblast',
        boxedImageUrl: require('./assets/os-Heatblast-boxed.png'),
        looseImageUrl: require('./assets/os-Heatblast-loose.png'),
        basePoints: 50,
      },
      {
        id: 'os-03',
        name: 'Wildmutt',
        boxedImageUrl: require('./assets/os-Wildmutt-boxed.png'),
        looseImageUrl: require('./assets/os-Wildmutt-loose.png'),
        basePoints: 50,
      },
      {
        id: 'os-04',
        name: 'Diamondhead',
        boxedImageUrl: require('./assets/os-Diamondhead-boxed.png'),
        looseImageUrl: require('./assets/os-Diamondhead-loose.png'),
        basePoints: 50,
      },
      {
        id: 'os-05',
        name: 'XLR8',
        boxedImageUrl: require('./assets/os-XLR8-boxed.png'),
        looseImageUrl: require('./assets/os-XLR8-loose.png'),
        basePoints: 50,
      },
      {
        id: 'os-06',
        name: 'Grey Matter',
        boxedImageUrl: require('./assets/os-Grey Matter-boxed.png'),
        looseImageUrl: require('./assets/os-Grey Matter-loose.png'),
        basePoints: 50,
      },
      {
        id: 'os-07',
        name: 'Four Arms',
        boxedImageUrl: require('./assets/os-Four Arms-boxed.png'),
        looseImageUrl: require('./assets/os-Four Arms-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-08',
        name: 'Stinkfly',
        boxedImageUrl: require('./assets/os-Stinkfly-boxed.png'),
        looseImageUrl: require('./assets/os-Stinkfly-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-09',
        name: 'Ripjaws',
        boxedImageUrl: require('./assets/os-Ripjaws-boxed.png'),
        looseImageUrl: require('./assets/os-Ripjaws-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-10',
        name: 'Upgrade',
        boxedImageUrl: require('./assets/os-Upgrade-boxed.png'),
        looseImageUrl: require('./assets/os-Upgrade-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-11',
        name: 'Ghostfreak',
        boxedImageUrl: require('./assets/os-Ghostfreak-boxed.png'),
        looseImageUrl: require('./assets/os-Ghostfreak-loose.png'),
        basePoints: 100,
      },
      {
        id: 'os-12',
        name: 'Cannonbolt',
        boxedImageUrl: require('./assets/os-Cannonbolt-boxed.png'),
        looseImageUrl: require('./assets/os-Cannonbolt-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-13',
        name: 'Cannonbolt-Fixed-Variant',
        boxedImageUrl: require('./assets/os-Cannonbolt-Fixed-Variant-boxed.png'),
        looseImageUrl: require('./assets/os-Cannonbolt-Fixed-Variant-loose.png'),
        basePoints: 200,
      },
      {
        id: 'os-14',
        name: 'Wildvine',
        boxedImageUrl: require('./assets/os-Wildvine-boxed.png'),
        looseImageUrl: require('./assets/os-Wildvine-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-15',
        name: 'Benwolf (Blitzwolfer)',
        boxedImageUrl: require('./assets/os-Benwolf (Blitzwolfer)-boxed.png'),
        looseImageUrl: require('./assets/os-Benwolf (Blitzwolfer)-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-16',
        name: 'Upchuck',
        boxedImageUrl: require('./assets/os-Upchuck-boxed.png'),
        looseImageUrl: require('./assets/os-Upchuck-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-17',
        name: 'Tetrax',
        boxedImageUrl: require('./assets/os-Tetrax-boxed.png'),
        looseImageUrl: require('./assets/os-Tetrax-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-18',
        name: 'SixSix',
        boxedImageUrl: require('./assets/os-SixSix-boxed.png'),
        looseImageUrl: require('./assets/os-SixSix-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-19',
        name: 'Vilgax',
        boxedImageUrl: require('./assets/os-Vilgax-boxed.png'),
        looseImageUrl: require('./assets/os-Vilgax-loose.png'),
        basePoints: 75,
      },
      {
        id: 'os-20',
        name: 'Kevin 11',
        boxedImageUrl: require('./assets/os-Kevin 11-boxed.png'),
        looseImageUrl: require('./assets/os-Kevin 11-loose.png'),
        basePoints: 75,
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
          },
          {
            id: 'os-bv-02',
            name: 'Ultra Ben (Battle Version)',
            boxedImageUrl: require('./assets/os-Ultra Ben (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Ultra Ben (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-03',
            name: 'Heatblast (Battle Version)',
            boxedImageUrl: require('./assets/os-Heatblast (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Heatblast (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-04',
            name: 'Wildmutt (Battle Version)',
            boxedImageUrl: require('./assets/os-Wildmutt (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Wildmutt (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-05',
            name: 'Diamondhead (Battle Version)',
            boxedImageUrl: require('./assets/os-Diamondhead (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Diamondhead (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-06',
            name: 'XLR8 (Battle Version)',
            boxedImageUrl: require('./assets/os-XLR8 (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-XLR8 (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-07',
            name: 'Gwen with Grey Matter (Battle Version)',
            boxedImageUrl: require('./assets/os-Gwen with Grey Matter (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Gwen with Grey Matter (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-08',
            name: 'Four Arms (Battle Version)',
            boxedImageUrl: require('./assets/os-Four Arms (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Four Arms (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-09',
            name: 'Stinkfly (Battle Version)',
            boxedImageUrl: require('./assets/os-Stinkfly (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Stinkfly (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-08-upg',
            name: 'Upgrade (Battle Version)',
            boxedImageUrl: require('./assets/os-Upgrade (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Upgrade (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-09-ghost',
            name: 'Ghostfreak - Zs Skayr (Battle Version)',
            boxedImageUrl: require('./assets/os-Ghostfreak - Zs Skayr (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Ghostfreak - Zs Skayr (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-10',
            name: 'Cannonbolt (Battle Version)',
            boxedImageUrl: require('./assets/os-Cannonbolt (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Cannonbolt (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-11',
            name: 'Cannonbolt - Fixed (Battle Version)',
            boxedImageUrl: require('./assets/os-Cannonbolt - Fixed (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Cannonbolt - Fixed (Battle Version)-loose.png'),
            basePoints: 200,
          },
          {
            id: 'os-bv-12',
            name: 'Wildvine (Battle Version)',
            boxedImageUrl: require('./assets/os-Wildvine (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Wildvine (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-13',
            name: 'Benwolf (Blitzwolfer) (Battle Version)',
            boxedImageUrl: require('./assets/os-Benwolf (Blitzwolfer) (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Benwolf (Blitzwolfer) (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-14',
            name: 'Benmummy (Snare-Oh) (Battle Version)',
            boxedImageUrl: require('./assets/os-Benmummy (Snare-Oh) (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Benmummy (Snare-Oh) (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-15',
            name: 'Benvicktor (Frankenstrike) (Battle Version)',
            boxedImageUrl: require('./assets/os-Benvicktor (Frankenstrike) (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Benvicktor (Frankenstrike) (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-16',
            name: 'Upchuck (Battle Version)',
            boxedImageUrl: require('./assets/os-Upchuck (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Upchuck (Battle Version)-loose.png'),
            basePoints: 50,
          },
          {
            id: 'os-bv-17',
            name: 'Vilgax (Battle Version)',
            boxedImageUrl: require('./assets/os-Vilgax (Battle Version)-boxed.png'),
            looseImageUrl: require('./assets/os-Vilgax (Battle Version)-loose.png'),
            basePoints: 50,
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
          },
          {
            id: 'os-acs-02',
            name: 'Four Arms (Alien Creature Series)',
            boxedImageUrl: require('./assets/os-Four Arms (Alien Creature Series)-boxed.png'),
            looseImageUrl: require('./assets/os-Four Arms (Alien Creature Series)-loose.png'),
            basePoints: 100,
          },
          {
            id: 'os-acs-03',
            name: 'XLR8 (Alien Creature Series)',
            boxedImageUrl: require('./assets/os-XLR8 (Alien Creature Series)-boxed.png'),
            looseImageUrl: require('./assets/os-XLR8 (Alien Creature Series)-loose.png'),
            basePoints: 100,
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
          },
          {
            id: 'os-r-02',
            name: 'Tetratanker',
            boxedImageUrl: require('./assets/os-Tetratanker-boxed.png'),
            looseImageUrl: require('./assets/os-Tetratanker-loose.png'),
            basePoints: 200,
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
          },
        ],
      },
      {
        title: '10 Figure Hero, Action & Other Multipack Sets',
        figures: [
          {
            id: 'os-mp-01',
            name: '10 Figure Hero Set',
            boxedImageUrl: require('./assets/os-10 Figure Hero Set-boxed.png'),
            looseImageUrl: require('./assets/os-10 Figure Hero Set-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1500,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-02',
            name: '10 Figure Hero Set 2',
            boxedImageUrl: require('./assets/os-10 Figure Hero Set 2-boxed.png'),
            looseImageUrl: require('./assets/os-10 Figure Hero Set 2-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1500,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-03',
            name: '10 Figure Hero Set 3',
            boxedImageUrl: require('./assets/os-10 Figure Hero Set 3-boxed.png'),
            looseImageUrl: require('./assets/os-10 Figure Hero Set 3-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1500,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-04',
            name: 'Ben 10 Action Set',
            boxedImageUrl: require('./assets/os-Ben 10 Action Set-boxed.png'),
            looseImageUrl: require('./assets/os-Ben 10 Action Set-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 900,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-05',
            name: 'Ben 10 Action Set B',
            boxedImageUrl: require('./assets/os-Ben 10 Action Set B-boxed.png'),
            looseImageUrl: require('./assets/os-Ben 10 Action Set B-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1000,
            LooseCompleteWorth: 500,
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-06',
            name: 'Ben 10 Heroes & Villains Set',
            boxedImageUrl: require('./assets/os-Ben 10 Heroes & Villains Set-boxed.png'),
            looseImageUrl: require('./assets/os-Ben 10 Heroes & Villains Set-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1000,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-07',
            name: 'Bens Ultimate Hero Set',
            boxedImageUrl: require('./assets/os-Bens Ultimate Hero Set-boxed.png'),
            looseImageUrl: require('./assets/os-Bens Ultimate Hero Set-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1200,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
          {
            id: 'os-mp-08',
            name: 'Ben Tennyson is Ultimate Alien Set',
            boxedImageUrl: require('./assets/os-Ben Tennyson is Ultimate Alien Set-boxed.png'),
            looseImageUrl: require('./assets/os-Ben Tennyson is Ultimate Alien Set-loose.png'),
            basePoints: 125,
            NewInBoxWorth: 1200,
            LooseCompleteWorth: 'None',
            LooseIncompleteWorth: 'None',
          },
        ],
      },
      {
        title: 'Omnitrixes',
        figures: [
          {
            id: 'os-o-01',
            name: 'Omnitrix FX',
            boxedImageUrl: require('./assets/os-Omnitrix FX-boxed.png'),
            looseImageUrl: require('./assets/os-Omnitrix FX-loose.png'),
            basePoints: 500,
          },
          {
            id: 'os-o-02',
            name: 'Omnitrix Alien Viewer',
            boxedImageUrl: require('./assets/os-Omnitrix Alien Viewer-boxed.png'),
            looseImageUrl: require('./assets/os-Omnitrix Alien Viewer-loose.png'),
            basePoints: 300,
          },
          {
            id: 'os-o-03',
            name: 'Deluxe Omnitrix',
            boxedImageUrl: require('./assets/os-Deluxe Omnitrix-boxed.png'),
            looseImageUrl: require('./assets/os-Deluxe Omnitrix-loose.png'),
            basePoints: 500,
          },
        ],
      },
      {
        title: 'DNA Alien Heroes',
        figures: [
          {
            id: 'os-DAH-01',
            name: 'Heatblast DNA',
            boxedImageUrl: require('./assets/os-Heatblast DNA-boxed.png'),
            looseImageUrl: require('./assets/os-Heatblast DNA-loose.png'),
            basePoints: 75,
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
        name: 'Ben Tennyson v1',
        boxedImageUrl: require('./assets/af-Ben Tennyson v1-boxed.png'),
        looseImageUrl: require('./assets/af-Ben Tennyson v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-02',
        name: 'Swampfire v1',
        boxedImageUrl: require('./assets/af-swampfire v1-boxed.png'),
        looseImageUrl: require('./assets/af-swampfire v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-03',
        name: 'Echo Echo v1',
        boxedImageUrl: require('./assets/af-Echo Echo v1-boxed.png'),
        looseImageUrl: require('./assets/af-Echo Echo v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-04',
        name: 'Humungousaur v1',
        boxedImageUrl: require('./assets/af-Humungousaur v1-boxed.png'),
        looseImageUrl: require('./assets/af-Humungousaur v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-05',
        name: 'Jet Ray v1',
        boxedImageUrl: require('./assets/af-Jet Ray v1-boxed.png'),
        looseImageUrl: require('./assets/af-Jet Ray v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-06',
        name: 'Big Chill v1',
        boxedImageUrl: require('./assets/af-Big Chill v1-boxed.png'),
        looseImageUrl: require('./assets/af-Big Chill v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-07',
        name: 'Chromastone v1',
        boxedImageUrl: require('./assets/af-Chromastone v1-boxed.png'),
        looseImageUrl: require('./assets/af-Chromastone v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-08',
        name: 'Brainstorm (Green Needle) v1',
        boxedImageUrl: require('./assets/af-Brainstorm (Green Needle) v1-boxed.png'),
        looseImageUrl: require('./assets/af-Brainstorm (Green Needle) v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-09',
        name: 'Spidermonkey v1',
        boxedImageUrl: require('./assets/af-Spidermonkey v1-boxed.png'),
        looseImageUrl: require('./assets/af-Spidermonkey v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-10',
        name: 'Goop v1',
        boxedImageUrl: require('./assets/af-Goop v1-boxed.png'),
        looseImageUrl: require('./assets/af-Goop v1-loose.png'),
        basePoints: 80,
      },
      {
        id: 'af-11',
        name: 'Alien X v1',
        boxedImageUrl: require('./assets/af-Alien X v1-boxed.png'),
        looseImageUrl: require('./assets/af-Alien X v1-loose.png'),
        basePoints: 80,
      },
    ],
  },
];

const FigureCard = ({ figure, item, ownershipState, onToggleState, showPoints, t }) => {
  const { width } = useWindowDimensions();
  const isWebPC = Platform.OS === 'web' && width > 768;

  const targetItem = item || figure;

  const imageSource =
    (ownershipState === 3 || ownershipState === 4) && hasLooseStates(targetItem)
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
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const isWebPC = Platform.OS === 'web' && SCREEN_WIDTH > 768;

  const GRID_PADDING = 12;
  const GRID_GAP = 8;
  const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

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
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [selectedUserCollection, setSelectedUserCollection] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLeaderboardFilterOpen, setIsLeaderboardFilterOpen] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('MAIN');
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isStatsFilterOpen, setIsStatsFilterOpen] = useState(false);
  const [statsSortOrder, setStatsSortOrder] = useState('MOST_OWN');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [globalStats, setGlobalStats] = useState({});

  // Profile Customization State
  const [favoriteSmoothy, setFavoriteSmoothy] = useState('Grasshopper');
  const [favoriteSeries, setFavoriteSeries] = useState('os-logo');
  const [favoriteFigure, setFavoriteFigure] = useState(null);
  const [isEditingFavoriteFigure, setIsEditingFavoriteFigure] = useState(false);
  const [favoriteFigureSearchQuery, setFavoriteFigureSearchQuery] = useState('');
  const [profileFlag1, setProfileFlag1] = useState('');
  const [profileFlag2, setProfileFlag2] = useState('');
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [isEditingFlag1, setIsEditingFlag1] = useState(false);
  const [isEditingFlag2, setIsEditingFlag2] = useState(false);

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

  // Memoized figures lists placed correctly at the top level of hooks
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

  const ownedFiguresList = useMemo(() => {
    const isViewingOther = selectedProfileUser && (!currentUser || selectedProfileUser.user_id !== currentUser.userId);
    const activeCol = isViewingOther ? selectedUserCollection : collectionState;

    return allFiguresList.filter((fig) => {
      const state = activeCol[fig.id] || 0;
      return state === 2 || state === 3 || state === 4;
    });
  }, [allFiguresList, collectionState, selectedProfileUser, selectedUserCollection, currentUser]);

  const activeSeries = LOCAL_SERIES_DATA[activeSeriesIndex];

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const getCombinedFlags = () => `${profileFlag1 || ''}${profileFlag2 || ''}`;

  // 1. Network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Global User Collections for Real Stats across all online user collections in Supabase
  const fetchGlobalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('collection_data');

      const statsMap = {};

      if (!error && data && data.length > 0) {
        const totalUsers = data.length;

        data.forEach((userRow) => {
          const colData = userRow.collection_data || {};
          Object.keys(colData).forEach((figId) => {
            const state = colData[figId];
            if (!statsMap[figId]) {
              statsMap[figId] = { ownCount: 0, nibCount: 0, looseCount: 0 };
            }
            if (state === 2 || state === 3 || state === 4) {
              statsMap[figId].ownCount += 1;
            }
            if (state === 2) {
              statsMap[figId].nibCount += 1;
            }
            if (state === 3 || state === 4) {
              statsMap[figId].looseCount += 1;
            }
          });
        });

        const computed = {};
        Object.keys(statsMap).forEach((figId) => {
          computed[figId] = {
            ownPct: Math.round((statsMap[figId].ownCount / totalUsers) * 100),
            nibPct: Math.round((statsMap[figId].nibCount / totalUsers) * 100),
            loosePct: Math.round((statsMap[figId].looseCount / totalUsers) * 100),
          };
        });

        setGlobalStats(computed);
      } else {
        const localUserCol = collectionState || {};
        const totalEntries = Object.keys(localUserCol).length || 1;
        const computed = {};

        Object.keys(localUserCol).forEach((figId) => {
          const state = localUserCol[figId];
          const isOwned = state === 2 || state === 3 || state === 4;
          const isNib = state === 2;
          const isLoose = state === 3 || state === 4;

          computed[figId] = {
            ownPct: isOwned ? Math.round((1 / totalEntries) * 100) : 0,
            nibPct: isNib ? Math.round((1 / totalEntries) * 100) : 0,
            loosePct: isLoose ? Math.round((1 / totalEntries) * 100) : 0,
          };
        });

        setGlobalStats(computed);
      }
    } catch (e) {
      console.error('Error fetching global stats:', e);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [collectionState]);

  // 2. Fetch User Cloud Data
  const fetchUserCloudData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('collection_data, favorite_smoothy, favorite_series, favorite_figure')
        .eq('user_id', userId)
        .single();

      if (data) {
        if (data.collection_data) {
          setCollectionState(data.collection_data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.collection_data));
        }
        if (data.favorite_smoothy) setFavoriteSmoothy(data.favorite_smoothy);
        if (data.favorite_series) setFavoriteSeries(data.favorite_series);
        if (data.favorite_figure !== undefined) setFavoriteFigure(data.favorite_figure);
        fetchGlobalStats();
      }
    } catch (err) {
      console.warn('No cloud collection found or offline, using local storage.');
    }
  };

  // 3. Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = {
          userId: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        };
        setCurrentUser(u);
        fetchUserCloudData(u.userId);
      } else {
        setCurrentUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          userId: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        };
        setCurrentUser(u);
        fetchUserCloudData(u.userId);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 4. App local data loading
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
          if (profile.favoriteFigure) setFavoriteFigure(profile.favoriteFigure);
          if (profile.profileFlag1 !== undefined) setProfileFlag1(profile.profileFlag1);
          if (profile.profileFlag2 !== undefined) setProfileFlag2(profile.profileFlag2);
          else if (profile.profileFlags) {
            setProfileFlag1(profile.profileFlags.slice(0, 2));
            setProfileFlag2(profile.profileFlags.slice(2, 4));
          }
        }
      } catch (error) {
        console.error('Failed to load local storage data:', error);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadAppData();
  }, []);

  const saveProfileData = async (smoothy, series, f1, f2, favFig) => {
    const updatedFavFig = favFig !== undefined ? favFig : favoriteFigure;
    try {
      await AsyncStorage.setItem(
        PROFILE_DATA_KEY,
        JSON.stringify({
          favoriteSmoothy: smoothy,
          favoriteSeries: series,
          profileFlag1: f1,
          profileFlag2: f2,
          favoriteFigure: updatedFavFig,
        })
      );

      if (currentUser && isOnline) {
        const combinedFlags = `${f1 || ''}${f2 || ''}`;
        const totalScore = calculateCollectionScoreForFilter(collectionState, 'MAIN');
        
        await supabase.from('leaderboard').upsert(
          {
            user_id: currentUser.userId,
            username: currentUser.username,
            score: totalScore,
            flag: combinedFlags,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        await supabase.from('user_collections').upsert(
          {
            user_id: currentUser.userId,
            collection_data: collectionState,
            favorite_smoothy: smoothy,
            favorite_series: series,
            favorite_figure: updatedFavFig,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch (e) {
      console.error('Failed to save profile details', e);
    }
  };

  const calculateCollectionScoreForFilter = (colData, filterType) => {
    let totalScore = 0;
    LOCAL_SERIES_DATA.forEach((series) => {
      series.figures.forEach((figure) => {
        const state = colData[figure.id] || 0;
        if (filterType === 'MAIN') {
          totalScore += calculateFigurePoints(figure, state);
        } else if (filterType === 'NIB' && state === 2) {
          totalScore += calculateFigurePoints(figure, state);
        } else if (filterType === 'LOOSE' && (state === 3 || state === 4)) {
          totalScore += calculateFigurePoints(figure, state);
        }
      });
      if (series.subsections) {
        series.subsections.forEach((sub) => {
          sub.figures.forEach((figure) => {
            const state = colData[figure.id] || 0;
            if (filterType === 'MAIN') {
              totalScore += calculateFigurePoints(figure, state);
            } else if (filterType === 'NIB' && state === 2) {
              totalScore += calculateFigurePoints(figure, state);
            } else if (filterType === 'LOOSE' && (state === 3 || state === 4)) {
              totalScore += calculateFigurePoints(figure, state);
            }
          });
        });
      }
    });
    return totalScore;
  };

  const buildLeaderboardList = async (filterType = leaderboardFilter) => {
    let remoteEntries = [];
    try {
      const { data: lbData, error } = await supabase
        .from('leaderboard')
        .select('user_id, username, flag, score');

      if (error) {
        console.error('Error fetching Supabase leaderboard data:', error.message);
      } else {
        console.log('Successfully fetched leaderboard rows from Supabase:', lbData?.length || 0);
      }

      if (lbData && lbData.length > 0) {
        remoteEntries = lbData.map((item) => ({
          user_id: item.user_id,
          username: item.username,
          flag: item.flag || '',
          favorite_smoothy: 'Grasshopper',
          favorite_series: 'os-logo',
          favorite_figure: null,
          score: filterType === 'MAIN' 
            ? (item.score || 0) 
            : (item.user_id === currentUser?.userId ? calculateCollectionScoreForFilter(collectionState, filterType) : (item.score || 0)),
        }));
      }
    } catch (e) {
      console.error('Unexpected leaderboard fetch error:', e);
    }

    if (currentUser) {
      const liveScore = calculateCollectionScoreForFilter(collectionState, filterType);
      const idx = remoteEntries.findIndex((e) => e.user_id === currentUser.userId);
      if (idx !== -1) {
        remoteEntries[idx].score = liveScore;
        remoteEntries[idx].flag = getCombinedFlags();
        remoteEntries[idx].username = currentUser.username;
        remoteEntries[idx].favorite_smoothy = favoriteSmoothy;
        remoteEntries[idx].favorite_series = favoriteSeries;
        remoteEntries[idx].favorite_figure = favoriteFigure;
      } else {
        remoteEntries.push({
          user_id: currentUser.userId,
          username: currentUser.username,
          flag: getCombinedFlags(),
          favorite_smoothy: favoriteSmoothy,
          favorite_series: favoriteSeries,
          favorite_figure: favoriteFigure,
          score: liveScore,
        });
      }
    }

    remoteEntries.sort((a, b) => b.score - a.score);

    if (remoteEntries.length === 0) {
      let activeSyncedUser = null;
      try {
        const syncData = await AsyncStorage.getItem(LEADERBOARD_SYNC_KEY);
        if (syncData) activeSyncedUser = JSON.parse(syncData);
      } catch (e) {
        console.error('Error fetching leaderboard sync data', e);
      }

      const currentScore = calculateCollectionScoreForFilter(collectionState, filterType);
      const activeName = currentUser ? currentUser.username : (activeSyncedUser?.username || null);

      if (activeName) {
        remoteEntries = [{ user_id: currentUser ? currentUser.userId : 'local', username: activeName, flag: getCombinedFlags(), favorite_smoothy: favoriteSmoothy, favorite_series: favoriteSeries, favorite_figure: favoriteFigure, score: currentScore }];
      }
    }

    const slots = Array.from({ length: 1000 }, (_, index) => {
      const position = index + 1;
      const entry = remoteEntries[index];

      return {
        id: `slot-${position}`,
        position,
        user_id: entry ? entry.user_id : null,
        username: entry ? `@${entry.username}` : '-',
        flag: entry ? entry.flag : '-',
        favorite_smoothy: entry ? entry.favorite_smoothy : 'Grasshopper',
        favorite_series: entry ? entry.favorite_series : 'os-logo',
        favorite_figure: entry ? entry.favorite_figure : null,
        score: entry ? `${entry.score} PTS` : '-',
      };
    });

    setLeaderboardData(slots);
  };

  const handleOpenLeaderboard = async () => {
    setIsMenuOpen(false);
    await buildLeaderboardList(leaderboardFilter);
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
    return calculateCollectionScoreForFilter(collectionState, 'MAIN');
  };

  const calculateCustomCollectionScore = (colData) => {
    return calculateCollectionScoreForFilter(colData, 'MAIN');
  };

  const handleToggleFigure = async (figureId) => {
    const figure = allFiguresList.find((f) => f.id === figureId);
    const currentState = collectionState[figureId] || 0;
    const hasLoose = hasLooseStates(figure);

    let nextState = 2;
    if (currentState === 0 || currentState === 1) {
      nextState = 2;
    } else if (currentState === 2) {
      nextState = hasLoose ? 3 : 0;
    } else if (currentState === 3) {
      nextState = 4;
    } else {
      nextState = 0;
    }

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

    if (currentUser && isOnline) {
      try {
        const { error: colError } = await supabase.from('user_collections').upsert({
          user_id: currentUser.userId,
          collection_data: updatedCollection,
          favorite_smoothy: favoriteSmoothy,
          favorite_series: favoriteSeries,
          favorite_figure: favoriteFigure,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (colError) {
          console.error('Cloud collection autosave error:', colError.message);
          return;
        }

        const newTotalScore = calculateCustomCollectionScore(updatedCollection);

        const { error: lbError } = await supabase.from('leaderboard').upsert(
          {
            user_id: currentUser.userId,
            username: currentUser.username,
            score: newTotalScore,
            flag: getCombinedFlags(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (lbError) {
          console.error('Leaderboard auto-sync error:', lbError.message);
        } else {
          fetchGlobalStats();
        }
      } catch (err) {
        console.error('Unexpected cloud sync error during figure toggle:', err);
      }
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
      const { data, error } = await supabase
        .from('leaderboard')
        .upsert(
          {
            user_id: currentUser.userId,
            username: currentUser.username,
            score: totalScore,
            flag: getCombinedFlags(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (error) {
        console.error('Leaderboard Upsert Error Detail:', error);
        Alert.alert('Sync Error', error.message || 'Failed to update leaderboard score.');
        return;
      }

      Alert.alert('Leaderboard Updated!', `Successfully updated score to ${totalScore} PTS for @${currentUser.username}.`);
    } catch (e) {
      console.error('Unexpected Leaderboard Error:', e);
      Alert.alert('Sync Error', 'An unexpected network error occurred.');
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
          fetchUserCloudData(data.user.id);
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
          fetchUserCloudData(data.user.id);
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
    setSelectedProfileUser(null);
    setSelectedUserCollection({});
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

  const sortedStatsFigures = useMemo(() => {
    const sorted = [...allFiguresList];
    sorted.sort((a, b) => {
      const statsA = globalStats[a.id] || { ownPct: 0, nibPct: 0, loosePct: 0 };
      const statsB = globalStats[b.id] || { ownPct: 0, nibPct: 0, loosePct: 0 };

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
  }, [allFiguresList, statsSortOrder, globalStats]);

  if (!fontsLoaded || !isStorageLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  const filteredData = getFilteredSeriesData();
  const isMyProfile = selectedProfileUser === null || (currentUser && selectedProfileUser.user_id === currentUser.userId);
  const currentProfileUsername = isMyProfile ? (currentUser ? currentUser.username : 'Guardabarranco') : selectedProfileUser.username;
  const currentProfileUserId = isMyProfile ? (currentUser ? currentUser.userId : 'USR-773921') : selectedProfileUser.userId;
  const currentProfileFlags = isMyProfile ? getCombinedFlags() : selectedProfileUser.flags;
  const currentProfileSmoothy = isMyProfile ? favoriteSmoothy : (selectedProfileUser.favoriteSmoothy || 'Grasshopper');
  const currentProfileSeries = isMyProfile ? favoriteSeries : (selectedProfileUser.favoriteSeries || 'os-logo');
  const currentProfileFigure = isMyProfile ? favoriteFigure : (selectedProfileUser.favoriteFigure || null);
  const currentProfileScore = isMyProfile ? calculateTotalScore() : String(selectedProfileUser.score).replace(' PTS', '');

  const activeSeriesObj = SERIES_LOGOS.find((s) => s.id === currentProfileSeries) || SERIES_LOGOS[0];
  const favoriteFigureObj = allFiguresList.find((f) => f.id === currentProfileFigure) || null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={activeSeriesIndex === 0 ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

        {/* Top Header */}
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
          <FlatList
            style={styles.listFlex}
            data={filteredData}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            contentContainerStyle={styles.listContentPadding}
            onScroll={(event) => {
              const yOffset = event.nativeEvent.contentOffset.y;
              const newIndex = yOffset >= 1000 ? 1 : 0;
              if (newIndex !== activeSeriesIndex) {
                setActiveSeriesIndex(newIndex);
              }
            }}
            scrollEventThrottle={16}
            renderItem={({ item: series, index: seriesIdx }) => (
              <View style={[styles.seriesContainerBlock, series.id === 'alien-force' ? styles.alienForceBlock : styles.osBlock]}>
                {series.id !== 'alien-force' && (
                  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Image
                      source={series.backgroundUrl}
                      style={styles.fullScreenBackground}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {seriesIdx > 0 && (
                  <View style={styles.seriesBorderSeparatorContainer}>
                    <LinearGradient
                      colors={series.colors.headerGradient}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                    <Image
                      source={series.logoUrl}
                      style={styles.seriesBorderLogoImage}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {series.id === 'alien-force' && (
                  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Image
                      source={series.backgroundUrl}
                      style={styles.fullScreenBackground}
                      resizeMode="cover"
                    />
                  </View>
                )}

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
          onRequestClose={() => {
            setIsProfileModalOpen(false);
            setSelectedProfileUser(null);
            setSelectedUserCollection({});
            setIsEditingFavoriteFigure(false);
          }}
        >
          <SafeAreaView style={styles.publicProfileContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.publicProfileHeader}>
              <TouchableOpacity
                style={styles.publicProfileCloseButton}
                onPress={() => {
                  setIsProfileModalOpen(false);
                  setSelectedProfileUser(null);
                  setSelectedUserCollection({});
                  setIsEditingFavoriteFigure(false);
                }}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Text style={styles.publicProfileCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.publicProfileBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.profileModalMainTitle}>{t.profileTitle}</Text>

              <Text style={styles.profileModalUsername}>
                {currentProfileUsername.startsWith('@') ? currentProfileUsername : `@${currentProfileUsername}`}
              </Text>

              <Text style={styles.profileModalUserId}>
                #{currentProfileUserId}
              </Text>

              <Text style={styles.profileModalSubHeader}>{t.fromLivesIn}</Text>
              
              <View style={styles.flagRowContainer}>
                <View style={styles.singleFlagWrapper}>
                  <Text style={styles.flagEmojiText}>
                    {isMyProfile ? (profileFlag1 || '🏳️') : (currentProfileFlags.slice(0, 2) || '🏳️')}
                  </Text>
                  {isMyProfile && currentUser && (
                    <TouchableOpacity
                      style={styles.pencilIconButton}
                      onPress={() => {
                        setIsEditingFlag1(!isEditingFlag1);
                        setIsEditingFlag2(false);
                      }}
                    >
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.singleFlagWrapper}>
                  <Text style={styles.flagEmojiText}>
                    {isMyProfile ? (profileFlag2 || '🏳️') : (currentProfileFlags.slice(2, 4) || '🏳️')}
                  </Text>
                  {isMyProfile && currentUser && (
                    <TouchableOpacity
                      style={styles.pencilIconButton}
                      onPress={() => {
                        setIsEditingFlag2(!isEditingFlag2);
                        setIsEditingFlag1(false);
                      }}
                    >
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isEditingFlag1 && isMyProfile && currentUser && (
                <View style={styles.flagPickerDropdown}>
                  <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={true}>
                    {AVAILABLE_FLAGS.map((opt) => (
                      <TouchableOpacity
                        key={`f1-${opt.value}`}
                        style={styles.flagOptionItem}
                        onPress={() => {
                          setProfileFlag1(opt.value);
                          saveProfileData(favoriteSmoothy, favoriteSeries, opt.value, profileFlag2, favoriteFigure);
                          setIsEditingFlag1(false);
                        }}
                      >
                        <Text style={styles.flagOptionText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {isEditingFlag2 && isMyProfile && currentUser && (
                <View style={styles.flagPickerDropdown}>
                  <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={true}>
                    {AVAILABLE_FLAGS.map((opt) => (
                      <TouchableOpacity
                        key={`f2-${opt.value}`}
                        style={styles.flagOptionItem}
                        onPress={() => {
                          setProfileFlag2(opt.value);
                          saveProfileData(favoriteSmoothy, favoriteSeries, profileFlag1, opt.value, favoriteFigure);
                          setIsEditingFlag2(false);
                        }}
                      >
                        <Text style={styles.flagOptionText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.profileTwoColumnRow}>
                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.favoriteSmoothy}</Text>
                  {isMyProfile ? (
                    <TextInput
                      style={styles.smoothyInputText}
                      value={favoriteSmoothy}
                      onChangeText={(val) => {
                        setFavoriteSmoothy(val);
                        saveProfileData(val, favoriteSeries, profileFlag1, profileFlag2, favoriteFigure);
                      }}
                      placeholder="Enter flavor"
                      placeholderTextColor="#888"
                      editable={!!currentUser}
                    />
                  ) : (
                    <Text style={styles.smoothyInputText}>{currentProfileSmoothy}</Text>
                  )}
                  {isMyProfile && currentUser && (
                    <View style={styles.boxPencilPosition}>
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.favoriteSeries}</Text>
                  <TouchableOpacity
                    style={styles.seriesLogoSelectArea}
                    onPress={() => {
                      if (isMyProfile && currentUser) setIsEditingSeries(!isEditingSeries);
                    }}
                    activeOpacity={isMyProfile && currentUser ? 0.7 : 1}
                  >
                    <Image
                      source={activeSeriesObj.image}
                      style={styles.seriesLogoPreview}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  {isMyProfile && currentUser && (
                    <TouchableOpacity
                      style={styles.boxPencilPosition}
                      onPress={() => setIsEditingSeries(!isEditingSeries)}
                    >
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isEditingSeries && isMyProfile && currentUser && (
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
                        saveProfileData(favoriteSmoothy, logoItem.id, profileFlag1, profileFlag2, favoriteFigure);
                        setIsEditingSeries(false);
                      }}
                    >
                      <Image source={logoItem.image} style={styles.seriesPickerLogo} resizeMode="contain" />
                      <Text style={styles.seriesPickerLabel}>{logoItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.profileTwoColumnRow}>
                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.collectorScore}</Text>
                  <View style={styles.scoreValueHighlightBox}>
                    <Text style={styles.scoreValueHighlightText}>{currentProfileScore}</Text>
                  </View>
                </View>

                <View style={styles.profileBoxCard}>
                  <Text style={styles.profileBoxTitle}>{t.favoriteFigure}</Text>
                  <TouchableOpacity
                    style={styles.favoriteFigureSelectArea}
                    onPress={() => {
                      if (isMyProfile && currentUser) setIsEditingFavoriteFigure(!isEditingFavoriteFigure);
                    }}
                    activeOpacity={isMyProfile && currentUser ? 0.7 : 1}
                  >
                    {favoriteFigureObj ? (
                      <Image
                        source={favoriteFigureObj.looseImageUrl}
                        style={styles.favoriteFigurePreview}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.favoriteFigurePlaceholderBox}>
                        <Text style={styles.favoriteFigurePlaceholderText}>+</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {isMyProfile && currentUser && (
                    <TouchableOpacity
                      style={styles.boxPencilPosition}
                      onPress={() => setIsEditingFavoriteFigure(!isEditingFavoriteFigure)}
                    >
                      <Text style={styles.pencilIconText}>✏️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isEditingFavoriteFigure && isMyProfile && currentUser && (
                <View style={styles.favoriteFigurePickerContainer}>
                  <TextInput
                    style={styles.favoriteFigureSearchInput}
                    placeholder={t.searchPlaceholder}
                    placeholderTextColor="#888"
                    value={favoriteFigureSearchQuery}
                    onChangeText={setFavoriteFigureSearchQuery}
                    autoFocus={true}
                  />
                  <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={true}>
                    {allFiguresList
                      .filter((fig) =>
                        fig.name.toLowerCase().includes(favoriteFigureSearchQuery.toLowerCase().trim())
                      )
                      .map((fig) => (
                        <TouchableOpacity
                          key={`fav-fig-${fig.id}`}
                          style={styles.favoriteFigurePickerItem}
                          onPress={() => {
                            setFavoriteFigure(fig.id);
                            saveProfileData(favoriteSmoothy, favoriteSeries, profileFlag1, profileFlag2, fig.id);
                            setIsEditingFavoriteFigure(false);
                            setFavoriteFigureSearchQuery('');
                          }}
                        >
                          <Image
                            source={fig.looseImageUrl}
                            style={styles.favoriteFigurePickerItemImage}
                            resizeMode="contain"
                          />
                          <Text style={styles.favoriteFigurePickerItemText}>{fig.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.profileCollectionBox}>
                <Text style={styles.profileCollectionBoxTitle}>{t.collection}</Text>
                {ownedFiguresList.length > 0 ? (
                  <View style={styles.profileCollectionGrid}>
                    {ownedFiguresList.map((fig) => {
                      const isViewingOther = selectedProfileUser && (!currentUser || selectedProfileUser.user_id !== currentUser.userId);
                      const activeColMap = isViewingOther ? selectedUserCollection : collectionState;
                      const state = activeColMap[fig.id] || 0;
                      const imgSource = (state === 3 || state === 4) && hasLooseStates(fig) ? fig.looseImageUrl : fig.boxedImageUrl;
                      return (
                        <View key={`prof-col-${fig.id}`} style={styles.profileCollectionItemCard}>
                          <Image source={imgSource} style={styles.profileCollectionItemImage} resizeMode="contain" />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.profileCollectionEmptyText}>No figures collected yet.</Text>
                )}
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
                const stats = globalStats[item.id] || { ownPct: 0, nibPct: 0, loosePct: 0 };

                return (
                  <View key={item.id} style={styles.statsCompactCardBox}>
                    <View style={styles.statsCompactNumberBadge}>
                      <Text style={styles.statsCompactNumberText}>{index + 1}</Text>
                    </View>

                    <Image
                      source={item.looseImageUrl}
                      style={styles.statsCompactLooseImage}
                      resizeMode="contain"
                    />

                    <View style={styles.statsCompactDetailsColumn}>
                      <Text style={styles.statsCompactOwnText}>{stats.ownPct}% Own it</Text>
                      <View style={styles.statsProgressBarBackground}>
                        <View style={[styles.statsProgressBarFill, { width: `${stats.ownPct}%` }]} />
                      </View>
                      <Text style={styles.statsCompactSubText}>{stats.nibPct}% NIB</Text>
                      <Text style={styles.statsCompactSubText}>{stats.loosePct}% Loose</Text>
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

        {/* Leaderboard Modal with Filter & Highlighting */}
        <Modal
          visible={isLeaderboardOpen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setIsLeaderboardOpen(false)}
        >
          <SafeAreaView style={styles.newsModalContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.newsHeader}>
              <View style={styles.newsHeaderBadgeRow}>
                <View style={styles.newsHeaderBadge}>
                  <Text style={styles.newsHeaderTitle}>{t.leaderboardTitle}</Text>
                </View>
                <TouchableOpacity
                  style={styles.leaderboardFilterTriggerBtn}
                  onPress={() => setIsLeaderboardFilterOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.leaderboardFilterTriggerIcon}>🎴</Text>
                </TouchableOpacity>
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
              renderItem={({ item }) => {
                const isClickable = item.username !== '-';
                const isCurrentUserRow = currentUser && item.user_id === currentUser.userId;

                return (
                  <TouchableOpacity
                    style={[
                      styles.leaderboardRow,
                      isCurrentUserRow && styles.leaderboardRowHighlighted,
                    ]}
                    activeOpacity={isClickable ? 0.7 : 1}
                    disabled={!isClickable}
                    onPress={async () => {
                      if (!isClickable) return;

                      setIsLeaderboardOpen(false);

                      let fetchedCol = {};
                      if (item.user_id && item.user_id !== 'local') {
                        try {
                          const { data: colData } = await supabase
                            .from('user_collections')
                            .select('collection_data')
                            .eq('user_id', item.user_id)
                            .single();
                          if (colData && colData.collection_data) {
                            fetchedCol = colData.collection_data;
                          }
                        } catch (e) {
                          console.error('Failed to fetch user collection for public profile:', e);
                        }
                      }

                      setSelectedUserCollection(fetchedCol);
                      setSelectedProfileUser({
                        username: item.username,
                        userId: item.user_id || 'PUBLIC-USER',
                        flags: item.flag || '',
                        score: item.score,
                        favoriteSmoothy: item.favorite_smoothy || 'Grasshopper',
                        favoriteSeries: item.favorite_series || 'os-logo',
                        favoriteFigure: item.favorite_figure || null,
                      });

                      setIsProfileModalOpen(true);
                    }}
                  >
                    <Text style={[styles.leaderboardCell, styles.rankCol]}>#{item.position}</Text>
                    <Text style={[styles.leaderboardCell, styles.userCol]} numberOfLines={1}>
                      {item.username}
                    </Text>
                    <Text style={[styles.leaderboardCell, styles.flagCol]}>{item.flag}</Text>
                    <Text style={[styles.leaderboardCell, styles.scoreCol]}>{item.score}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </Modal>

        {/* Leaderboard Category Filter Modal */}
        <Modal
          visible={isLeaderboardFilterOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsLeaderboardFilterOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsLeaderboardFilterOpen(false)}>
            <View style={styles.filterModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.leaderboardFilterCard}>
                  <TouchableOpacity
                    style={styles.leaderboardFilterOptionItem}
                    onPress={async () => {
                      setLeaderboardFilter('MAIN');
                      setIsLeaderboardFilterOpen(false);
                      await buildLeaderboardList('MAIN');
                    }}
                  >
                    <Text style={[styles.leaderboardFilterOptionText, leaderboardFilter === 'MAIN' && styles.leaderboardFilterOptionActiveText]}>
                      Main Leaderboard
                    </Text>
                    {leaderboardFilter === 'MAIN' && <View style={styles.leaderboardFilterIndicator} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.leaderboardFilterOptionItem}
                    onPress={async () => {
                      setLeaderboardFilter('NIB');
                      setIsLeaderboardFilterOpen(false);
                      await buildLeaderboardList('NIB');
                    }}
                  >
                    <Text style={[styles.leaderboardFilterOptionText, leaderboardFilter === 'NIB' && styles.leaderboardFilterOptionActiveText]}>
                      New in Box Leaderboard
                    </Text>
                    {leaderboardFilter === 'NIB' && <View style={styles.leaderboardFilterIndicator} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.leaderboardFilterOptionItem}
                    onPress={async () => {
                      setLeaderboardFilter('LOOSE');
                      setIsLeaderboardFilterOpen(false);
                      await buildLeaderboardList('LOOSE');
                    }}
                  >
                    <Text style={[styles.leaderboardFilterOptionText, leaderboardFilter === 'LOOSE' && styles.leaderboardFilterOptionActiveText]}>
                      Loose Leaderboard
                    </Text>
                    {leaderboardFilter === 'LOOSE' && <View style={styles.leaderboardFilterIndicator} />}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
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
                        setSelectedProfileUser(null);
                        setSelectedUserCollection({});
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

                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'pt' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('pt')}
                    >
                      <Text style={styles.filterChipText}>Português</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'th' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('th')}
                    >
                      <Text style={styles.filterChipText}>ไทย</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'hi' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('hi')}
                    >
                      <Text style={styles.filterChipText}>हिन्दी</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterChipVertical, language === 'zh' && styles.filterChipActive]}
                      onPress={() => handleSelectLanguage('zh')}
                    >
                      <Text style={styles.filterChipText}>中文</Text>
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
                    <Text style={styles.menuItemLabel}>{t.stats}</Text>
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
    backgroundColor: '#0A181C',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seriesContainerBlock: {
    position: 'relative',
    overflow: 'hidden',
  },
  osBlock: {
    backgroundColor: '#F7F7E6',
  },
  alienForceBlock: {
    backgroundColor: '#0A181C',
    minHeight: SCREEN_HEIGHT,
  },
  fullScreenBackground: {
    width: SCREEN_WIDTH,
    height: '100%',
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
    backgroundColor: 'transparent',
  },
  listFlex: {
    flex: 1,
  },
  listContentPadding: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  seriesBorderSeparatorContainer: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 5,
    marginVertical: 0,
  },
  seriesBorderLogoImage: {
    width: 120,
    height: 38,
    zIndex: 10,
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
    gap: 16,
    marginBottom: 16,
  },
  singleFlagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
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
    maxWidth: 260,
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
    marginVertical: 8,
  },
  profileBoxCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    height: 100,
    justifyContent: 'space-between',
  },
  profileBoxTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
  scoreValueHighlightBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#39FF14',
    alignSelf: 'center',
    marginTop: 4,
  },
  scoreValueHighlightText: {
    color: '#39FF14',
    fontSize: 18,
    fontWeight: 'bold',
  },
  favoriteFigureSelectArea: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteFigurePreview: {
    width: '100%',
    height: '100%',
  },
  favoriteFigurePlaceholderBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  favoriteFigurePlaceholderText: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  favoriteFigurePickerContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    marginBottom: 16,
  },
  favoriteFigureSearchInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  favoriteFigurePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  favoriteFigurePickerItemImage: {
    width: 40,
    height: 40,
  },
  favoriteFigurePickerItemText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  profileCollectionBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
    alignItems: 'center',
  },
  profileCollectionBoxTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  profileCollectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  profileCollectionItemCard: {
    width: 68,
    height: 68,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileCollectionItemImage: {
    width: '100%',
    height: '100%',
  },
  profileCollectionEmptyText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 12,
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
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statsCompactCardBox: {
    width: (SCREEN_WIDTH - 32) / 3 - 4,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  statsCompactNumberBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#334155',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  statsCompactNumberText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statsCompactLooseImage: {
    width: 50,
    height: 50,
    marginVertical: 4,
  },
  statsCompactDetailsColumn: {
    width: '100%',
    alignItems: 'center',
  },
  statsCompactOwnText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsProgressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statsProgressBarFill: {
    height: '100%',
    backgroundColor: '#39FF14',
  },
  statsCompactSubText: {
    color: '#94A3B8',
    fontSize: 9,
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
  newsHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  leaderboardFilterTriggerBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardFilterTriggerIcon: {
    fontSize: 14,
  },
  leaderboardFilterCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  leaderboardFilterOptionItem: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  leaderboardFilterOptionText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardFilterOptionActiveText: {
    color: '#F8FAFC',
  },
  leaderboardFilterIndicator: {
    width: 140,
    height: 3,
    backgroundColor: '#38BDF8',
    marginTop: 8,
    borderRadius: 2,
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
  leaderboardRowHighlighted: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
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