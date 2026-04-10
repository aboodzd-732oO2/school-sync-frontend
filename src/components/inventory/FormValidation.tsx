
interface ItemToAdd {
  id: string;
  selectedItem: string;
  customItemName: string;
  quantity: number;
  minThreshold: number;
}

export const validateInventoryForm = (itemsToAdd: ItemToAdd[]): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  itemsToAdd.forEach((item) => {
    if (!item.selectedItem) {
      newErrors[`selectedItem_${item.id}`] = 'يجب اختيار عنصر من القائمة';
    }

    if (item.selectedItem === 'أخرى' && !item.customItemName.trim()) {
      newErrors[`customItemName_${item.id}`] = 'يجب كتابة وصف العنصر المخصص';
    }

    if (item.quantity <= 0) {
      newErrors[`quantity_${item.id}`] = 'الكمية يجب أن تكون أكبر من صفر';
    }

    if (item.minThreshold < 0) {
      newErrors[`minThreshold_${item.id}`] = 'حد التنبيه يجب أن يكون صفر أو أكبر';
    }
  });

  return newErrors;
};
