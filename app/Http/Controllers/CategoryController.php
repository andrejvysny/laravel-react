<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $categories = Auth::user()->categories()
            ->with('parentCategory')
            ->get();
        $categories = $categories->map(function ($category) {
            $category->parent_category_id = $category->parentCategory ? $category->parentCategory->id : null;
            return $category;
        });

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:255'],
            'parent_category_id' => ['nullable', 'string'],
        ]);

        $data = $validated;
        if ($data['parent_category_id'] === '0') {
            $data['parent_category_id'] = null;
        } else if ($data['parent_category_id'] !== null) {
            $data['parent_category_id'] = (int) $data['parent_category_id'];
        }

        $category = Auth::user()->categories()->create($data);

        return redirect()->back()->with('success', 'Category created successfully');
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:7'],
            'icon' => ['nullable', 'string', 'max:255'],
            'parent_category_id' => ['nullable', 'string'],
        ]);

        $data = $validated;
        if ($data['parent_category_id'] === '0') {
            $data['parent_category_id'] = null;
        } else if ($data['parent_category_id'] !== null) {
            $data['parent_category_id'] = (int) $data['parent_category_id'];
        }

        // Additional validation for parent_category_id
        if ($data['parent_category_id'] !== null) {
            $request->validate([
                'parent_category_id' => [
                    'exists:categories,id',
                    Rule::notIn([$category->id]) // Prevent setting itself as parent
                ],
            ]);
        }

        $category->update($data);

        return redirect()->back()->with('success', 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully');
    }
}
