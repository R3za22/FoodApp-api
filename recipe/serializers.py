"""
Serializes for the Recipe API View
"""

from rest_framework import serializers

from core.models import (Recipe, Tag, Ingredient)


class IngredientSerializer(serializers.ModelSerializer):
    """serializer for ingredients"""
    recipe_count = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'recipe_count']
        read_only_fields = ['id', 'recipe_count']

    def get_recipe_count(self, obj) -> int:
        return obj.recipe_set.count()


class RecipeIngredientSerializer(serializers.ModelSerializer):
    """compact ingredient shown inside a recipe"""

    class Meta:
        model = Ingredient
        fields = ['id', 'name']
        read_only_fields = ['id']


class TagSerializer(serializers.ModelSerializer):
    """serializer for tags"""
    recipe_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'recipe_count']
        read_only_fields = ['id', 'recipe_count']

    def get_recipe_count(self, obj) -> int:
        return obj.recipe_set.count()


class RecipeTagSerializer(serializers.ModelSerializer):
    """compact tag shown inside a recipe"""

    class Meta:
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']


class RecipeSerializer(serializers.ModelSerializer):
    """serializer for Recipes"""
    tags = RecipeTagSerializer(many=True, required=False)
    ingredients = RecipeIngredientSerializer(many=True, required=False)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'time_minutes', 'price', 'link', 'tags',
                  'ingredients']
        read_only_fields = ['id']

    def _get_or_create_tags(self, tags, recipe):
        """handle getting or creating tags as needed"""
        auth_user = self.context['request'].user
        for tag in tags:
            tag_obj, created = Tag.objects.get_or_create(
                user=auth_user,
                **tag,
            )
            recipe.tags.add(tag_obj)

    def _get_or_create_ingredients(self, ingredients, recipe):
        """handle getting or creating ingredients as needed"""
        auth_user = self.context['request'].user
        for ingredient in ingredients:
            obj, created = Ingredient.objects.get_or_create(
                user=auth_user,
                **ingredient,
            )
            recipe.ingredients.add(obj)

    def create(self, validated_data):
        """create a recipe"""
        tags = validated_data.pop('tags', [])
        ingredients = validated_data.pop('ingredients', [])
        recipe = Recipe.objects.create(**validated_data)
        self._get_or_create_tags(tags, recipe)
        self._get_or_create_ingredients(ingredients, recipe)

        return recipe

    def update(self, instance, validated_data):
        """update recipe"""
        tags = validated_data.pop('tags', None)
        ingredients = validated_data.pop('ingredients', None)
        if tags is not None:
            instance.tags.clear()
            self._get_or_create_tags(tags, instance)
        if ingredients is not None:
            instance.ingredients.clear()
            self._get_or_create_ingredients(ingredients, instance)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class RecipeDetailSerializer(RecipeSerializer):
    """serializer for recipe detail view"""

    class Meta(RecipeSerializer.Meta):
        fields = RecipeSerializer.Meta.fields + ['description', 'image']


class RecipeImageSerializer(serializers.ModelSerializer):
    """serializer for uploading an iamge to recipe"""

    class Meta:
        model = Recipe
        fields = ['id', 'image']
        read_only_fields = ['id']
        extra_kwargs = {'image': {'required': 'True'}}
