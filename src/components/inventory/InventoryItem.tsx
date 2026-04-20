
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X, PlusCircle, Settings, AlertTriangle, Trash2, CheckCircle } from "lucide-react";

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
    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-[background-color,border-color,box-shadow,color] shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <Badge variant="outline">{item.category}</Badge>
            {item.quantity <= item.minThreshold && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>منخفض</span>
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">الكمية المتوفرة</span>
              {addingQuantity ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-primary">{item.quantity} {item.unitType}</span>
                  <span className="text-muted-foreground">+</span>
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
                <span className="font-bold text-primary">{item.quantity} {item.unitType}</span>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted-foreground">حد التنبيه</span>
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
              <span className="text-muted-foreground">الحالة</span>
              {item.quantity > item.minThreshold ? (
                <span className="flex items-center gap-1.5 font-medium text-success">
                  <CheckCircle className="size-4" />
                  متوفر
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-warning-foreground">
                  <AlertTriangle className="size-4" />
                  منخفض
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {editingItem ? (
            <>
              <Button 
                size="sm" 
                onClick={handleSaveItemEdit}
                className="bg-primary hover:bg-primary-700 text-primary-foreground shadow-md hover:shadow-lg transition-[background-color,border-color,box-shadow,color]"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelItemEdit}
                className="border-border hover:border-red-400 hover:bg-danger/10 hover:text-danger transition-[background-color,border-color,box-shadow,color]"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : addingQuantity ? (
            <>
              <Button 
                size="sm" 
                onClick={handleSaveQuantity}
                className="bg-warning/20 hover:bg-warning/30 text-warning-foreground shadow-md hover:shadow-lg transition-[background-color,border-color,box-shadow,color]"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelQuantity}
                className="border-border hover:border-red-400 hover:bg-danger/10 hover:text-danger transition-[background-color,border-color,box-shadow,color]"
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
                className="bg-danger hover:bg-danger text-white shadow-md hover:shadow-lg transition-[background-color,border-color,box-shadow,color]"
              >
                <Trash2 className="h-4 w-4 ms-1" />
                تأكيد الحذف
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCancelDelete}
                className="border-border hover:border-border hover:bg-muted/30 transition-[background-color,border-color,box-shadow,color]"
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
                className="border-warning/30 bg-warning/10 text-muted-foreground hover:bg-warning/20 hover:border-warning hover:text-warning-foreground shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow,color] font-medium"
              >
                <PlusCircle className="h-4 w-4 ms-1" />
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
                className="border-primary/30 bg-muted/50 text-primary hover:bg-primary/10 hover:border-primary hover:text-primary shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow,color] font-medium"
              >
                <Settings className="h-4 w-4 ms-1" />
                تعديل
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDeleteClick}
                className="border-danger/40 bg-danger/10 text-danger hover:bg-danger/15 hover:border-red-400 hover:text-danger shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow,color] font-medium"
              >
                <Trash2 className="h-4 w-4 ms-1" />
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
