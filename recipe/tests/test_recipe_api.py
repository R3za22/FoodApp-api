"""
tests for recipe APIs
"""

from decimal import Decimal
import tempfile
import os

from PIL import Image


from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient

from core.models import (Recipe, Tag, Ingredient)

from recipe.serializers import (
    RecipeSerializer,
    RecipeDetailSerializer,
)

# from recipe.serializers import RecipeSerializer


RECIPES_URL = reverse("recipe:recipe-list")


def detail_url(recipe_id):
    """create and return a recipe detail URL"""
    return reverse('recipe:recipe-detail', args=[recipe_id])


def image_upload_url(recipe_id):
    """create and return an image upload url"""
    return reverse('recipe:recipe-upload-image', args=[recipe_id])


def create_recipe(user, **params):
    """create and return a sample recipe"""
    defaults = {
        "title": "sample recipe title",
        "time_minutes": 22,
        "price": Decimal("5.25"),
        "description": "sample recipe decription",
        'link': "https://example.com"
    }
    defaults.update(params)

    recipe = Recipe.objects.create(user=user, **defaults)
    return recipe


def create_user(**params):
    """create and return a new user"""
    return get_user_model().objects.create_user(**params)


class PublicRecipeAPITests(TestCase):
    """test unauthenticated api requests"""

    def setUp(self):
        self.client = APIClient()

    def test_auth_reqired(self):
        """test auth is required to call the api"""
        res = self.client.get(RECIPES_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateRecipeAPITests(TestCase):
    """"test for authenticated user api requests"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user(
            email='user@example.com', password='testpass123')
        self.client.force_authenticate(self.user)

    def test_retrive_recipes(self):
        """test retriving a list of recipes"""
        create_recipe(user=self.user)
        create_recipe(user=self.user)

        res = self.client.get(RECIPES_URL)

        recipes = Recipe.objects.all().order_by('-id')
        serializer = RecipeSerializer(recipes, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_recipe_list_limited_to_user(self):
        """test list of recipes is the one for that users"""

        other_user = create_user(
            email="secondtestuser@example.com", password="secondtestpass123"
        )

        create_recipe(user=other_user)
        create_recipe(user=self.user)

        res = self.client.get(RECIPES_URL)

        recipes = Recipe.objects.filter(user=self.user)
        serializer = RecipeSerializer(recipes, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_get_recipe_detail(self):
        """test get recipe details"""
        recipe = create_recipe(user=self.user)

        url = detail_url(recipe.id)
        res = self.client.get(url)

        serializer = RecipeDetailSerializer(recipe)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_recipe(self):
        """test creating a recipe"""

        payload = {
            "title": "sample recipe title",
            "time_minutes": 30,
            "price": Decimal("5.99"),
        }
        res = self.client.post(RECIPES_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.get(id=res.data['id'])
        for k, v in payload.items():
            self.assertEqual(getattr(recipe, k), v)
        self.assertEqual(recipe.user, self.user)

    def test_partial_update(self):
        """test partial update of a recipe"""
        original_link = "https://example.com/recipe.pdf"
        recipe = create_recipe(
            user=self.user,
            title='sample recipe title',
            link=original_link
        )

        payload = {"title": "new recipe title"}
        url = detail_url(recipe.id)
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        recipe.refresh_from_db()
        self.assertEqual(recipe.title, payload["title"])
        self.assertEqual(recipe.link, original_link)
        self.assertEqual(recipe.user, self.user)

    def test_full_update(self):
        """test full update of a recipe"""
        recipe = create_recipe(
            user=self.user,
            title='sample recipe title',
            link="https://example.com/recipe.pdf",
            description="test description for this recipe"
        )
        payload = {
            "title": "new recipe title",
            "link": "https://example.com/newrecipe.pdf",
            "description": "NEW description for this recipe",
            "time_minutes": 20,
            "price": Decimal(2.50),
        }
        url = detail_url(recipe.id)
        res = self.client.put(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        recipe.refresh_from_db()
        for k, v in payload.items():
            self.assertEqual(getattr(recipe, k), v)
        self.assertEqual(recipe.user, self.user)

    def test_update_user_returns_error(self):
        """test changin the recipe user throws error"""
        new_user = create_user(
            email="user7@example.com",
            password="testpass789")
        recipe = create_recipe(user=self.user)

        payload = {'user': new_user.id}
        url = detail_url(recipe.id)
        self.client.patch(url, payload)
        recipe.refresh_from_db()
        self.assertEqual(recipe.user, self.user)

    def test_delete_recipe(self):
        """test delting a recipe is successful"""
        recipe = create_recipe(user=self.user)

        url = detail_url(recipe.id)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recipe.objects.filter(id=recipe.id).exists())

    def test_delete_other_users_recipe_error(self):
        """test trying to delete another users recipe returnms error"""
        new_user = create_user(
            email="user7@example.com",
            password="testpass789")
        recipe = create_recipe(user=new_user)
        url = detail_url(recipe.id)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Recipe.objects.filter(id=recipe.id).exists())

    def test_create_recipe_with_new_tags(self):
        """test creating a recipe with new tags"""

        payload = {
            "title": "Qorme Sabzi",
            'time_minutes': 36,
            'price': Decimal(66.66),
            'tags': [
                {"name": "irani"}, {"name": "best"}
            ]
        }
        res = self.client.post(RECIPES_URL, payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        recipes = Recipe.objects.filter(user=self.user)
        self.assertEqual(recipes.count(), 1)
        recipe = recipes[0]
        self.assertEqual(recipe.tags.count(), 2)
        for tag in payload['tags']:
            exists = recipe.tags.filter(
                name=tag['name'],
                user=self.user
            ).exists()
            self.assertTrue(exists)

    def test_creating_recipe_with_existing_tag(self):
        """test creating a recipe with existing tags"""
        tag_irani = Tag.objects.create(
            user=self.user,
            name="irani"
        )
        payload = {
            "title": "Makaroooni",
            'time_minutes': 25,
            'price': Decimal(89.66),
            'tags': [
                {"name": "irani"}, {"name": "best"}
            ]
        }
        res = self.client.post(RECIPES_URL, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        recipes = Recipe.objects.filter(user=self.user)
        self.assertEqual(recipes.count(), 1)
        recipe = recipes[0]
        self.assertEqual(recipe.tags.count(), 2)
        # this will check if its the same old tag in db
        self.assertIn(tag_irani, recipe.tags.all())
        for tag in payload['tags']:
            exists = recipe.tags.filter(
                name=tag['name'],
                user=self.user
            ).exists()
            self.assertTrue(exists)

    def test_create_tag_on_update(self):
        """Testing creating tag on updating a recipe"""
        recipe = create_recipe(user=self.user)

        payload = {'tags': [{"name": "BreakFast"}]}
        url = detail_url(recipe.id)
        res = self.client.patch(url, payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        new_tag = Tag.objects.get(user=self.user, name="BreakFast")

        self.assertIn(new_tag, recipe.tags.all())

    def test_update_recipe_assign_tag(self):
        """Testing assign an existing tag on updating a recipe"""

        tag_irani = Tag.objects.create(
            user=self.user,
            name="irani"
        )
        recipe = create_recipe(user=self.user)
        recipe.tags.add(tag_irani)

        tag_breakfast = Tag.objects.create(
            user=self.user,
            name="breakfast"
        )

        payload = {'tags': [{"name": "breakfast"}]}
        url = detail_url(recipe.id)
        res = self.client.patch(url, payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn(tag_breakfast, recipe.tags.all())
        self.assertNotIn(tag_irani, recipe.tags.all())

    def test_clear_recipe_tags(self):
        """Test clearing recipe tags"""
        tag = Tag.objects.create(
            user=self.user,
            name="irani"
        )
        recipe = create_recipe(user=self.user)
        recipe.tags.add(tag)
        payload = {'tags': []}
        url = detail_url(recipe.id)
        res = self.client.patch(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(recipe.tags.count(), 0)
        self.assertNotIn(tag, recipe.tags.all())

    def test_filter_by_tags(self):
        """Test filtering recipes by tags"""
        r1 = create_recipe(user=self.user, title="qorme Sabzi")
        r2 = create_recipe(user=self.user, title="makarooni")
        tag1 = Tag.objects.create(user=self.user, name="vegan")
        tag2 = Tag.objects.create(user=self.user, name="meatLover")
        r1.tags.add(tag1)
        r2.tags.add(tag2)
        r3 = create_recipe(user=self.user, title="dampokhtak")

        params = {'tags': f"{tag1.id},{tag2.id}"}
        res = self.client.get(RECIPES_URL, params)

        s1 = RecipeSerializer(r1)
        s2 = RecipeSerializer(r2)
        s3 = RecipeSerializer(r3)
        self.assertIn(s1.data, res.data)
        self.assertIn(s2.data, res.data)
        self.assertNotIn(s3.data, res.data)

    def test_filter_by_ingredients(self):
        """test filtering recipes by ingredients"""
        r1 = create_recipe(user=self.user, title="chai")
        r2 = create_recipe(user=self.user, title="qahve")
        ingredient1 = Ingredient.objects.create(user=self.user, name="shekar")
        ingredient2 = Ingredient.objects.create(user=self.user, name="namak")
        r1.ingredients.add(ingredient1)
        r2.ingredients.add(ingredient2)
        r3 = create_recipe(user=self.user, title="felfel")

        params = {'ingredients': f"{ingredient1.id},{ingredient2.id}"}
        res = self.client.get(RECIPES_URL, params)

        s1 = RecipeSerializer(r1)
        s2 = RecipeSerializer(r2)
        s3 = RecipeSerializer(r3)
        self.assertIn(s1.data, res.data)
        self.assertIn(s2.data, res.data)
        self.assertNotIn(s3.data, res.data)


class ImageUploadTests(TestCase):
    """tests for the iamge upload api"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user(email='user@example.com',
                                password="passweord123")
        self.client.force_authenticate(self.user)
        self.recipe = create_recipe(user=self.user)

    def tearDown(self):
        self.recipe.image.delete()

    def test_uploadimage(self):
        """testing uploading a image"""
        url = image_upload_url(self.recipe.id)
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image_file:
            img = Image.new('RGB', (10, 10))
            img.save(image_file, format="JPEG")
            image_file.seek(0)
            payload = {"image": image_file}
            res = self.client.post(url, payload, format="multipart")

        self.recipe.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('image', res.data)
        self.assertTrue(os.path.exists(self.recipe.image.path))

    def test_upload_image_bad_request(self):
        """test uploading invalid image"""
        url = image_upload_url(self.recipe.id)
        payload = {'image': 'notanimage'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
