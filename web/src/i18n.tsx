import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'fa';

const en = {
  appName: 'FoodApp',
  skip: 'Skip to content',
  navRecipes: 'My recipes',
  navManage: 'Tags and ingredients',
  navProfile: 'Profile',
  newRecipe: 'New recipe',
  apiDocs: 'API docs',
  switchLang: 'فارسی',
  loading: 'Loading…',
  retry: 'Try again',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  rename: 'Rename',
  keepIt: 'Keep it',
  copy: 'Copy',
  copied: 'Copied',
  reveal: 'Reveal',
  hide: 'Hide',
  // auth
  heroTitle: 'Your recipes, tagged and findable',
  heroBody: 'Keep every recipe with its ingredients, tags and a photo. Filter by what is in the fridge.',
  signUpTitle: 'Create an account',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  signUp: 'Sign up',
  signUpNote: 'Your email is your login. We never show it on recipes.',
  logInTitle: 'Log in',
  logIn: 'Log in',
  logInNote: 'Logging in gives this browser an API token. Log out any time from your profile.',
  loginFailedTitle: 'Could not log in.',
  loginFailedBody: 'The email or password does not match. Check them and try again.',
  signedUp: 'Account created. You can log in now.',
  demoAccount: 'Demo account: demo@example.com / demo12345',
  // recipes
  recipesCount: '{n} recipes',
  recipesCountOne: '1 recipe',
  searchLabel: 'Search recipes',
  searchPlaceholder: 'Search by title',
  filters: 'Filters',
  clear: 'Clear',
  tags: 'Tags',
  ingredients: 'Ingredients',
  noMatchTitle: 'No recipes match',
  noMatchBody: 'Try removing a tag or ingredient filter, or add a new recipe.',
  clearFilters: 'Clear filters',
  emptyTitle: 'No recipes yet',
  emptyBody: 'Add your first recipe to start building your shelf.',
  errorTitle: 'Could not reach the server',
  errorBody: 'Your recipes are safe. Check your connection and try again.',
  minutes: '{n} min',
  // detail
  allRecipes: 'All recipes',
  time: 'Time',
  price: 'Price',
  source: 'Source',
  editRecipe: 'Edit recipe',
  deleteRecipe: 'Delete recipe',
  deleteConfirm: 'Delete this recipe?',
  deleteConfirmBody: 'This cannot be undone.',
  method: 'Method',
  noIngredients: 'No ingredients listed.',
  notFoundTitle: 'Page not found',
  notFoundBody: 'That page does not exist. It may have been moved or deleted.',
  backHome: 'Back to my recipes',
  // edit
  backToRecipe: 'Back to recipe',
  editTitle: 'Edit recipe',
  newTitle: 'New recipe',
  saveRecipe: 'Save recipe',
  saving: 'Saving…',
  basics: 'Basics',
  titleLabel: 'Title',
  descLabel: 'Description and method',
  timeLabel: 'Time (minutes)',
  priceLabel: 'Price',
  linkLabel: 'Link (optional)',
  addTag: 'Add tag',
  addTagLabel: 'Add a tag',
  addTagHelp: 'New names are created for you when you save.',
  removeTag: 'Remove tag {name}',
  addIngredientLabel: 'Add an ingredient',
  addIngredient: 'Add ingredient',
  photo: 'Photo',
  choosePhoto: 'Choose a photo',
  photoHelp: 'JPG or PNG. In this build the photo stays in your browser.',
  removePhoto: 'Remove photo',
  uploading: 'Uploading photo…',
  errTitleRequired: 'Enter a title.',
  errTime: 'A valid integer is required.',
  errPrice: 'No more than 5 digits in total, 2 after the point.',
  errLink: 'Enter a full link starting with http:// or https://.',
  // manage
  manageTitle: 'Tags and ingredients',
  manageIntro: 'These lists belong to your account. Renaming changes every recipe that uses the name. Deleting removes it from those recipes.',
  newTag: 'New tag',
  newIngredient: 'New ingredient',
  tagPlaceholder: 'e.g. Quick',
  ingredientPlaceholder: 'e.g. saffron',
  usedIn: 'Used in {n} recipes',
  usedInOne: 'Used in 1 recipe',
  notUsed: 'Not used yet',
  ingredientName: 'Name',
  deleteAttr: 'Delete {name}',
  deleteAttrTitle: 'Delete {name}?',
  deleteAttrBody: 'It is used in {n} recipes and will be removed from them.',
  emptyList: 'Nothing here yet.',
  // profile
  profileTitle: 'Your details',
  avatarNote: 'Your initial is used as your picture.',
  newPassword: 'New password (leave empty to keep)',
  passwordPlaceholder: 'At least 5 characters',
  saveChanges: 'Save changes',
  saved: 'Saved',
  tokenTitle: 'API token',
  tokenBody: 'Use this token to call the recipe API from scripts. Send it in the Authorization header. Treat it like a password.',
  sessionTitle: 'Session',
  sessionBody: 'Logging out removes the token from this browser. The token itself stays valid until you rotate it in the admin.',
  logOut: 'Log out',
  mockTokenNote: 'Sample token: this build runs on local sample data, no server is contacted.',
  resetDemo: 'Reset demo data',
  resetDemoBody: 'Restore the sample recipes, tags and ingredients.',
  language: 'Language',
  // about
  aboutTitle: 'About and privacy',
  aboutBody1: 'FoodApp is a portfolio project: a React client for a Django REST recipe API. It follows the structure of a public API course and was extended with recipe ingredients, tag and ingredient management and a typed client.',
  aboutBody2: 'In this build all recipes are sample data stored only in your browser (localStorage). Nothing is sent to a server, no cookies are set and there is no tracking. Clear site data to remove everything.',
  aboutBody3: 'Made by Reza Ghamar.',
  aboutLink: 'About and privacy',
  // demo banner
  demoBanner: 'Demo · sample data · ',
  demoBack: '← rezaghamar.ir',
  dismiss: 'Dismiss',
  // generic errors
  genericError: 'Something went wrong. Try again.',
};

export type Key = keyof typeof en;

const fa: Record<Key, string> = {
  appName: 'FoodApp',
  skip: 'پرش به محتوا',
  navRecipes: 'دستور پخت‌های من',
  navManage: 'برچسب‌ها و مواد',
  navProfile: 'پروفایل',
  newRecipe: 'دستور جدید',
  apiDocs: 'مستندات API',
  switchLang: 'EN',
  loading: 'در حال بارگذاری…',
  retry: 'تلاش دوباره',
  save: 'ذخیره',
  cancel: 'انصراف',
  delete: 'حذف',
  rename: 'تغییر نام',
  keepIt: 'نگه دار',
  copy: 'کپی',
  copied: 'کپی شد',
  reveal: 'نمایش',
  hide: 'پنهان',
  heroTitle: 'دستورهای شما، برچسب‌خورده و پیدا‌شدنی',
  heroBody: 'هر دستور پخت را با مواد لازم، برچسب‌ها و یک عکس نگه دارید. بر اساس چیزی که در یخچال دارید فیلتر کنید.',
  signUpTitle: 'ساخت حساب',
  name: 'نام',
  email: 'ایمیل',
  password: 'گذرواژه',
  signUp: 'ثبت‌نام',
  signUpNote: 'ایمیل شما همان نام کاربری است و روی دستورها نمایش داده نمی‌شود.',
  logInTitle: 'ورود',
  logIn: 'ورود',
  logInNote: 'با ورود، یک توکن API برای این مرورگر ساخته می‌شود. هر زمان از پروفایل خارج شوید.',
  loginFailedTitle: 'ورود ناموفق بود.',
  loginFailedBody: 'ایمیل یا گذرواژه درست نیست. دوباره بررسی کنید.',
  signedUp: 'حساب ساخته شد. اکنون می‌توانید وارد شوید.',
  demoAccount: 'حساب نمونه: demo@example.com / demo12345',
  recipesCount: '{n} دستور پخت',
  recipesCountOne: '۱ دستور پخت',
  searchLabel: 'جستجو',
  searchPlaceholder: 'جستجو در عنوان‌ها',
  filters: 'فیلترها',
  clear: 'پاک کردن',
  tags: 'برچسب‌ها',
  ingredients: 'مواد لازم',
  noMatchTitle: 'دستوری پیدا نشد',
  noMatchBody: 'یک فیلتر برچسب یا ماده را بردارید یا دستور تازه‌ای اضافه کنید.',
  clearFilters: 'پاک کردن فیلترها',
  emptyTitle: 'هنوز دستوری ندارید',
  emptyBody: 'اولین دستور پخت را اضافه کنید.',
  errorTitle: 'ارتباط با سرور برقرار نشد',
  errorBody: 'دستورهای شما سالم هستند. اتصال را بررسی کنید و دوباره تلاش کنید.',
  minutes: '{n} دقیقه',
  allRecipes: 'همه دستورها',
  time: 'زمان',
  price: 'هزینه',
  source: 'منبع',
  editRecipe: 'ویرایش دستور',
  deleteRecipe: 'حذف دستور',
  deleteConfirm: 'این دستور حذف شود؟',
  deleteConfirmBody: 'این کار قابل بازگشت نیست.',
  method: 'طرز تهیه',
  noIngredients: 'ماده‌ای ثبت نشده است.',
  notFoundTitle: 'صفحه پیدا نشد',
  notFoundBody: 'این صفحه وجود ندارد؛ شاید جابه‌جا یا حذف شده باشد.',
  backHome: 'بازگشت به دستورها',
  backToRecipe: 'بازگشت به دستور',
  editTitle: 'ویرایش دستور',
  newTitle: 'دستور جدید',
  saveRecipe: 'ذخیره دستور',
  saving: 'در حال ذخیره…',
  basics: 'اطلاعات اصلی',
  titleLabel: 'عنوان',
  descLabel: 'توضیح و طرز تهیه',
  timeLabel: 'زمان (دقیقه)',
  priceLabel: 'هزینه',
  linkLabel: 'پیوند (اختیاری)',
  addTag: 'افزودن برچسب',
  addTagLabel: 'افزودن برچسب',
  addTagHelp: 'برچسب‌های تازه هنگام ذخیره ساخته می‌شوند.',
  removeTag: 'حذف برچسب {name}',
  addIngredientLabel: 'افزودن ماده',
  addIngredient: 'افزودن ماده',
  photo: 'عکس',
  choosePhoto: 'انتخاب عکس',
  photoHelp: 'JPG یا PNG. در این نسخه عکس فقط در مرورگر شما می‌ماند.',
  removePhoto: 'حذف عکس',
  uploading: 'در حال بارگذاری عکس…',
  errTitleRequired: 'عنوان را وارد کنید.',
  errTime: 'یک عدد صحیح وارد کنید.',
  errPrice: 'حداکثر ۵ رقم در کل و ۲ رقم اعشار.',
  errLink: 'یک پیوند کامل با http:// یا https:// وارد کنید.',
  manageTitle: 'برچسب‌ها و مواد',
  manageIntro: 'این فهرست‌ها به حساب شما تعلق دارند. تغییر نام در همه دستورها اعمال می‌شود و حذف، مورد را از آن‌ها برمی‌دارد.',
  newTag: 'برچسب جدید',
  newIngredient: 'ماده جدید',
  tagPlaceholder: 'مثلاً سریع',
  ingredientPlaceholder: 'مثلاً زعفران',
  usedIn: 'در {n} دستور',
  usedInOne: 'در ۱ دستور',
  notUsed: 'هنوز استفاده نشده',
  ingredientName: 'نام',
  deleteAttr: 'حذف {name}',
  deleteAttrTitle: '«{name}» حذف شود؟',
  deleteAttrBody: 'در {n} دستور استفاده شده و از آن‌ها برداشته می‌شود.',
  emptyList: 'هنوز چیزی نیست.',
  profileTitle: 'مشخصات شما',
  avatarNote: 'حرف اول نام شما به‌جای عکس نمایش داده می‌شود.',
  newPassword: 'گذرواژه جدید (برای حفظ قبلی خالی بگذارید)',
  passwordPlaceholder: 'حداقل ۵ نویسه',
  saveChanges: 'ذخیره تغییرات',
  saved: 'ذخیره شد',
  tokenTitle: 'توکن API',
  tokenBody: 'با این توکن می‌توانید API دستورها را از اسکریپت صدا بزنید. آن را در هدر Authorization بفرستید و مثل گذرواژه محافظت کنید.',
  sessionTitle: 'نشست',
  sessionBody: 'با خروج، توکن از این مرورگر پاک می‌شود. خود توکن تا زمانی که در پنل مدیریت عوض نکنید معتبر می‌ماند.',
  logOut: 'خروج',
  mockTokenNote: 'توکن نمونه: این نسخه روی داده‌های نمونهٔ محلی کار می‌کند و به هیچ سروری وصل نمی‌شود.',
  resetDemo: 'بازنشانی داده‌های نمونه',
  resetDemoBody: 'دستورها، برچسب‌ها و مواد نمونه را برمی‌گرداند.',
  language: 'زبان',
  aboutTitle: 'دربارهٔ برنامه و حریم خصوصی',
  aboutBody1: 'FoodApp یک پروژهٔ نمونه‌کار است: کلاینت React برای یک API دستور پخت با Django REST. ساختار آن از یک دورهٔ آموزشی API گرفته شده و با مواد لازم، مدیریت برچسب و ماده و کلاینت تایپ‌دار گسترش یافته است.',
  aboutBody2: 'در این نسخه همهٔ دستورها داده‌های نمونه‌اند و فقط در مرورگر شما (localStorage) ذخیره می‌شوند. چیزی به سرور فرستاده نمی‌شود، کوکی‌ای ساخته نمی‌شود و رهگیری وجود ندارد. با پاک کردن داده‌های سایت همه‌چیز حذف می‌شود.',
  aboutBody3: 'ساختهٔ رضا قمر.',
  aboutLink: 'دربارهٔ برنامه و حریم خصوصی',
  demoBanner: 'نسخهٔ نمایشی · داده‌های نمونه · ',
  demoBack: '← rezaghamar.ir',
  dismiss: 'بستن',
  genericError: 'مشکلی پیش آمد. دوباره تلاش کنید.',
};

export const dictionaries: Record<Lang, Record<Key, string>> = { en, fa };

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = dictionaries[lang][key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** Locale-aware number (Persian digits in FA). */
export function formatNumber(lang: Lang, n: number | string, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { useGrouping: false, ...opts }).format(Number(n));
}

export function formatPrice(lang: Lang, price: string | number): string {
  return formatNumber(lang, price, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface I18n {
  lang: Lang;
  setLang(l: Lang): void;
  t(key: Key, vars?: Record<string, string | number>): string;
  num(n: number | string): string;
  price(p: string | number): string;
}

const Ctx = createContext<I18n | null>(null);
const STORE = 'foodapp.lang';

function initialLang(): Lang {
  try {
    const v = localStorage.getItem(STORE);
    if (v === 'fa' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORE, l);
    } catch {
      /* ignore */
    }
  }, []);
  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      num: (n) => formatNumber(lang, n),
      price: (p) => formatPrice(lang, p),
    }),
    [lang, setLang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}
