
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitType: string;
  minThreshold: number;
  department: string;
  warehouseName: string;
}

export class ItemMatchingService {
  // تحسين مطابقة العناصر - البحث بشكل أكثر دقة
  static findMatchingItem(inventory: InventoryItem[], requestedItem: string): InventoryItem | undefined {
    const cleanRequest = requestedItem.toLowerCase().trim();
    
    // البحث الدقيق أولاً
    let matchedItem = inventory.find(item => 
      item.name.toLowerCase().trim() === cleanRequest
    );

    // إذا لم نجد تطابقاً دقيقاً، نبحث عن تطابق جزئي
    if (!matchedItem) {
      matchedItem = inventory.find(item => 
        item.name.toLowerCase().includes(cleanRequest) ||
        cleanRequest.includes(item.name.toLowerCase())
      );
    }

    // البحث في نوع العنصر أيضاً
    if (!matchedItem) {
      matchedItem = inventory.find(item => 
        item.category.toLowerCase().includes(cleanRequest) ||
        cleanRequest.includes(item.category.toLowerCase())
      );
    }

    return matchedItem;
  }

  // تحديث قائمة العناصر لتطابق تماماً ما هو موجود في RequestForm
  static getInstitutionalItemTypes(department: string): string[] {
    const items = {
      'materials': [
        '🪑 كراسي',
        '✏️ أقلام', 
        '📋 ألواح',
        '🌀 مراوح',
        '🪟 ستائر',
        '❄️ مكيفات',
        '🔥 مدافئ',
        '✍️ طباشير',
        '💻 حاسوب',
        '📽️ بروجكتر'
      ],
      'maintenance': [
        '⚡ مشاكل كهربائية',
        '💧 مشاكل مياه',
        '🔌 توصيلات',
        '🏗️ إصلاحات المبنى',
        '🧹 تنظيف'
      ],
      'academic-materials': [
        '📚 كتب مدرسية',
        '📄 أوراق',
        '📓 دفاتر',
        '📝 قرطاسية'
      ],
      'technology': [
        '💻 حاسوب',
        '💾 برمجيات',
        '🌐 شبكة',
        '🎵 سمعي بصري'
      ],
      'safety': [
        '🔥 السلامة من الحريق',
        '🔒 أمن',
        '🚨 معدات الطوارئ'
      ]
    };
    return items[department as keyof typeof items] || [];
  }
}
