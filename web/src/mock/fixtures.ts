export interface SeedRecipe {
  title: string;
  description: string;
  time: number;
  price: string;
  link: string;
  tags: string[];
  ingredients: string[];
}

export interface Seed {
  tags: string[];
  ingredients: string[];
  recipes: SeedRecipe[];
}

export const en: Seed = {
  tags: ['Breakfast', 'Vegetarian', 'Soup', 'Dinner', 'Dessert', 'Rice'],
  ingredients: ['eggs', 'tomatoes', 'red onion', 'red pepper', 'garlic', 'cumin', 'smoked paprika', 'parsley', 'lentils', 'saffron', 'barberries', 'rice', 'herbs'],
  recipes: [
    { title: 'Smoky tomato shakshuka', description: 'Soften the onion and pepper in oil, add garlic, cumin and smoked paprika, then the tomatoes. Simmer until thick, make wells, crack in the eggs and cover for six minutes. Finish with parsley.', time: 25, price: '4.50', link: '', tags: ['Breakfast', 'Vegetarian'], ingredients: ['eggs', 'tomatoes', 'red onion', 'red pepper', 'garlic', 'cumin', 'smoked paprika', 'parsley'] },
    { title: 'Herb frittata (kuku sabzi)', description: 'Fold a bowl of chopped herbs into beaten eggs with a pinch of saffron, then bake until set.', time: 40, price: '3.80', link: '', tags: ['Vegetarian', 'Dinner'], ingredients: ['eggs', 'herbs', 'saffron'] },
    { title: 'Lentil soup (adasi)', description: 'Simmer lentils with onion and cumin, blend half, and finish with lemon.', time: 45, price: '2.90', link: '', tags: ['Soup', 'Vegetarian'], ingredients: ['lentils', 'red onion', 'cumin'] },
    { title: 'Ghormeh sabzi', description: 'Slow-cook fried herbs with kidney beans and dried limes until the oil rises.', time: 180, price: '9.20', link: '', tags: ['Dinner'], ingredients: ['herbs', 'red onion'] },
    { title: 'Chicken and barberry rice', description: 'Layer saffron rice with chicken and sweet-sour barberries, then steam.', time: 100, price: '8.40', link: '', tags: ['Dinner', 'Rice'], ingredients: ['rice', 'saffron', 'barberries'] },
    { title: 'Saffron rice pudding', description: 'Cook rice in milk with sugar and saffron until creamy.', time: 90, price: '3.10', link: '', tags: ['Dessert', 'Vegetarian'], ingredients: ['rice', 'saffron'] },
  ],
};

export const fa: Seed = {
  tags: ['صبحانه', 'گیاهی', 'سوپ', 'شام', 'دسر', 'پلو'],
  ingredients: ['تخم‌مرغ', 'گوجه', 'پیاز', 'فلفل دلمه‌ای', 'سیر', 'زیره', 'سبزی', 'عدس', 'زعفران', 'زرشک', 'برنج'],
  recipes: [
    { title: 'املت گوجه دودی', description: 'پیاز و فلفل را در روغن تفت دهید، سیر و زیره را اضافه کنید، سپس گوجه را بریزید. تا غلیظ شدن بپزید، تخم‌مرغ‌ها را بشکنید و شش دقیقه در را ببندید.', time: 25, price: '4.50', link: '', tags: ['صبحانه', 'گیاهی'], ingredients: ['تخم‌مرغ', 'گوجه', 'پیاز', 'فلفل دلمه‌ای', 'سیر', 'زیره'] },
    { title: 'کوکو سبزی', description: 'سبزی خرد شده را با تخم‌مرغ و کمی زعفران مخلوط کنید و در فر یا ماهیتابه بپزید.', time: 40, price: '3.80', link: '', tags: ['گیاهی', 'شام'], ingredients: ['تخم‌مرغ', 'سبزی', 'زعفران'] },
    { title: 'سوپ عدس', description: 'عدس را با پیاز و زیره بپزید، نیمی از آن را له کنید و با آبلیمو سرو کنید.', time: 45, price: '2.90', link: '', tags: ['سوپ', 'گیاهی'], ingredients: ['عدس', 'پیاز', 'زیره'] },
    { title: 'قورمه‌سبزی', description: 'سبزی تفت‌داده را با لوبیا و لیمو عمانی آهسته بپزید تا روغنش بیفتد.', time: 180, price: '9.20', link: '', tags: ['شام'], ingredients: ['سبزی', 'پیاز'] },
    { title: 'زرشک‌پلو با مرغ', description: 'برنج زعفرانی را با مرغ و زرشک لایه‌لایه کنید و دم بگذارید.', time: 100, price: '8.40', link: '', tags: ['شام', 'پلو'], ingredients: ['برنج', 'زعفران', 'زرشک'] },
    { title: 'شله‌زرد', description: 'برنج را با شکر و زعفران در آب بپزید تا غلیظ و خوش‌رنگ شود.', time: 90, price: '3.10', link: '', tags: ['دسر', 'گیاهی'], ingredients: ['برنج', 'زعفران'] },
  ],
};
