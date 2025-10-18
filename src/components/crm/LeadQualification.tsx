import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Facebook, 
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface QualificationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string[];
  autoAssignRules?: string;
}

interface Lead {
  id: string;
  companyName: string;
  website?: string;
  categories: string[];
  qualificationReason?: string;
}

export function LeadQualification() {
  const [categories, setCategories] = useState<QualificationCategory[]>([
    {
      id: '1',
      name: 'Website Active',
      description: 'Companies with functioning websites',
      icon: '🌐',
      color: 'green',
      criteria: ['Has website URL', 'Website loads successfully', 'Recent updates visible'],
    },
    {
      id: '2',
      name: 'No Website',
      description: 'Companies without any website presence',
      icon: '🚫',
      color: 'red',
      criteria: ['No website URL found', 'Domain not registered'],
    },
    {
      id: '3',
      name: 'Outdated Design',
      description: 'Websites with old/outdated design',
      icon: '📅',
      color: 'orange',
      criteria: ['Design looks 5+ years old', 'Not mobile responsive', 'Slow loading'],
    },
    {
      id: '4',
      name: 'Broken Website',
      description: 'Websites that are not working properly',
      icon: '⚠️',
      color: 'red',
      criteria: ['Website returns errors', '404 not found', 'Domain expired'],
    },
    {
      id: '5',
      name: 'Social Media Only',
      description: 'Only Facebook page or social media, no website',
      icon: '📱',
      color: 'blue',
      criteria: ['Has Facebook page', 'Has Instagram', 'No dedicated website'],
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QualificationCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '🏷️',
    color: 'blue',
    criteria: [''],
  });

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const validCriteria = newCategory.criteria.filter(c => c.trim() !== '');
    if (validCriteria.length === 0) {
      toast.error('Please add at least one criterion');
      return;
    }

    const category: QualificationCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      criteria: validCriteria,
    };

    setCategories([...categories, category]);
    setShowCreateDialog(false);
    setNewCategory({
      name: '',
      description: '',
      icon: '🏷️',
      color: 'blue',
      criteria: [''],
    });
    toast.success('Category created successfully');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const validCriteria = newCategory.criteria.filter(c => c.trim() !== '');
    if (validCriteria.length === 0) {
      toast.error('Please add at least one criterion');
      return;
    }

    setCategories(categories.map(cat => 
      cat.id === editingCategory.id
        ? { ...cat, ...newCategory, criteria: validCriteria }
        : cat
    ));

    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
      icon: '🏷️',
      color: 'blue',
      criteria: [''],
    });
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    toast.success('Category deleted');
  };

  const addCriterion = () => {
    setNewCategory({
      ...newCategory,
      criteria: [...newCategory.criteria, ''],
    });
  };

  const updateCriterion = (index: number, value: string) => {
    const updated = [...newCategory.criteria];
    updated[index] = value;
    setNewCategory({ ...newCategory, criteria: updated });
  };

  const removeCriterion = (index: number) => {
    setNewCategory({
      ...newCategory,
      criteria: newCategory.criteria.filter((_, i) => i !== index),
    });
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="mb-1 text-gray-900">Lead Qualification</h2>
            <p className="text-gray-500 text-sm sm:text-base">Organize leads into categories based on qualification criteria</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-blue-900 mb-2 font-semibold">How Lead Qualification Works</h4>
              <p className="text-sm text-blue-700 mb-3">
                Create custom categories to organize your leads. When you find leads via Lead Finder, 
                you can assign them to categories based on their qualification criteria.
              </p>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Create categories like "No Website", "Outdated Design", "Social Media Only"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Manually assign leads to categories or set up auto-assignment rules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Save qualification reasons for each lead</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Bulk-select qualified leads and move them to campaigns</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-4 min-w-full lg:min-w-0">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="border-2 border-gray-200 hover:border-blue-300 transition-colors min-h-[320px] w-[340px] lg:w-auto flex flex-col flex-shrink-0"
            >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3 overflow-hidden">
                <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl leading-none">{category.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <CardTitle className="text-lg mb-1 truncate">{category.name}</CardTitle>
                    <p className="text-sm text-gray-500 line-clamp-2 break-words">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCategory(category);
                      setNewCategory({
                        name: category.name,
                        description: category.description,
                        icon: category.icon,
                        color: category.color,
                        criteria: category.criteria,
                      });
                    }}
                    className="h-8 w-8 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="h-8 w-8 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Qualification Criteria:</p>
                  <ul className="space-y-2">
                    {category.criteria.map((criterion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Badge className={`${getCategoryColor(category.color)} border text-xs px-3 py-1`}>
                  {category.color} label
                </Badge>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || editingCategory !== null} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingCategory(null);
          setNewCategory({
            name: '',
            description: '',
            icon: '🏷️',
            color: 'blue',
            criteria: [''],
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              Define a qualification category and its criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Category Name</Label>
                <Input
                  placeholder="e.g., No Website"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>

              <div>
                <Label className="mb-2 block">Icon</Label>
                <Input
                  placeholder="🏷️"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="text-2xl"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Description</Label>
              <Textarea
                placeholder="Brief description of this category..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label className="mb-2 block">Label Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['blue', 'green', 'red', 'orange', 'purple', 'gray'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all min-w-[100px] ${
                      newCategory.color === color
                        ? `${getCategoryColor(color)} border-current`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Qualification Criteria</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCriterion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criterion
                </Button>
              </div>
              <div className="space-y-3">
                {newCategory.criteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., Website loads successfully"
                      value={criterion}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      className="flex-1"
                    />
                    {newCategory.criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(index)}
                        className="flex-shrink-0 h-11 w-11"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingCategory(null);
                setNewCategory({
                  name: '',
                  description: '',
                  icon: '🏷️',
                  color: 'blue',
                  criteria: [''],
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
