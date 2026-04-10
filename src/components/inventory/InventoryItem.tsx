
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X, PlusCircle, Settings, AlertTriangle, Trash2 } from "lucide-react";

interface InventoryItemType {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitType: string;
  minThreshold: number;
  department: string;
  warehouseName: string;
}

interface InventoryItemProps {
  item: InventoryItemType;
  onSaveThreshold: (itemId: string, threshold: number) => void;
  onAddQuantity: (itemId: string, quantity: number) => void;
  onUpdateItem: (itemId: string, quantity: number, threshold: number) => void;
  onDeleteItem: (itemId: string) => void;
}

const InventoryItem = ({ item, onSaveThreshold, onAddQuantity, onUpdateItem, onDeleteItem }: InventoryItemProps) => {
  const [editingItem, setEditingItem] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editThreshold, setEditThreshold] = useState(item.minThreshold);
  const [addingQuantity, setAddingQuantity] = useState(false);
  const [quantityValue, setQuantityValue] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveItemEdit = () => {
    onUpdateItem(item.id, editQuantity, editThreshold);
    setEditingItem(false);
  };

  const handleCancelItemEdit = () => {
    setEditQuantity(item.quantity);
    setEditThreshold(item.minThreshold);
    setEditingItem(false);
  };

  const handleSaveQuantity = () => {
    if (quantityValue > 0) {
      onAddQuantity(item.id, quantityValue);
      setAddingQuantity(false);
      setQuantityValue(0);
    }
  };

  const handleCancelQuantity = () => {
    setQuantityValue(0);
    setAddingQuantity(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDeleteItem(item.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="border border-[hsl(142,30%,85%)] rounded-lg p-4 hover:bg-[hsl(142,30%,96%)] transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <Badge variant="outline">{item.category}</Badge>
            {item.quantity <= item.minThreshold && (
              <Badge variant="destructive" className="flex items-center space-x-1 space-x-reverse">
                <AlertTriangle className="h-3 w-3" />
                <span>منخفض</span>
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600">الكمية المتوفرة</span>
              {addingQuantity ? (
                <div className="flex items-center space-x-2 space-x-reverse mt-1">
                  <span className="font-bold text-[hsl(142,60%,25%)]">{item.quantity} {item.unitType}</span>
                  <span className="text-gray-500">+</span>
                  <Input
                    type="number"
                    value={quantityValue}
                    onChange={(e) => setQuantityValue(parseInt(e.target.value) || 0)}
                    className="w-20"
                    placeholder="0"
                  />
                </div>
              ) : editingItem ? (
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <span className="font-bold text-[hsl(142,60%,25%)]">{item.quantity} {item.unitType}</span>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-600">حد التنبيه</span>
              {editingItem ? (
                <Input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              ) : (
                <span className="font-medium">{item.minThreshold} {item.unitType}</span>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-600">الحالة</span>
              <span className={`font-medium ${
                item.quantity > item.minThreshold ? 'text-[hsl(142,60%,25%)]' : 'text-[hsl(38,85%,60%)]'
              }`}>
                {item.quantity > item.minThreshold ? '✅ متوفر' : '⚠️ منخفض'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          {editingItem ? (
            <>
              <Button 
                size="sm" 
                onClick={handleSaveItemEdit}
                className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] hover:from-[hsl(142,60%,30%)] hover:to-[hsl(142,50%,25%)] text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelItemEdit}
                className="border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : addingQuantity ? (
            <>
              <Button 
                size="sm" 
                onClick={handleSaveQuantity}
                className="bg-gradient-to-r from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] hover:from-[hsl(38,85%,65%)] hover:to-[hsl(38,90%,55%)] text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelQuantity}
                className="border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : showDeleteConfirm ? (
            <>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                تأكيد الحذف
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelDelete}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAddingQuantity(true)}
                className="border-[hsl(38,70%,50%)] bg-[hsl(38,30%,96%)] text-[hsl(38,80%,50%)] hover:bg-[hsl(38,40%,94%)] hover:border-[hsl(38,85%,60%)] hover:text-[hsl(38,85%,60%)] shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                إضافة كمية
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setEditingItem(true);
                  setEditQuantity(item.quantity);
                  setEditThreshold(item.minThreshold);
                }}
                className="border-[hsl(142,50%,30%)] bg-[hsl(142,30%,96%)] text-[hsl(142,60%,25%)] hover:bg-[hsl(142,40%,94%)] hover:border-[hsl(142,50%,25%)] hover:text-[hsl(142,60%,30%)] shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                <Settings className="h-4 w-4 mr-1" />
                تعديل
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDeleteClick}
                className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                حذف
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryItem;
