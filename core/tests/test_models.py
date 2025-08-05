"""
Tests for Models in the core application of the FoodApp project.
"""
from unittest.mock import patch
from decimal import Decimal

from django.test import TestCase
from django.contrib.auth import get_user_model

from core import models


def create_user(
        email="user@example.com", password="testpass123"):
    """create and retrun a new user"""
    return get_user_model().objects.create_user(email, password)


class ModelTests(TestCase):
    """Test Models"""

    def test_create_user_with_email_successful(self):
        """ Testing creating a user with an email is successful """
        email = "test@example.com"
        password = "testpass123"
        user = get_user_model().objects.create_user(
            email=email,
            password=password,
        )

        self.assertEqual(user.email, email)
        """ using check_password becuz we gonna hash the pass """
        self.assertTrue(user.check_password(password))

    def test_new_user_email_normalized(self):
        """ Test If Email Was Normalized For new Users """
        sample_emails = [
            ("test1@EXAMPLE.com", "test1@example.com"),
            ("Test2@Example.com", "Test2@example.com"),
            ("TEST3@EXAMPLE.COM", "TEST3@example.com"),
            ("test4@example.COM", "test4@example.com"),
        ]
        for email, excepted in sample_emails:
            user = get_user_model().objects.create_user(email, "sample123")
            self.assertEqual(user.email, excepted)

    def test_new_user_without_email_raises_error(self):
        """ Test That Creating a user Without an email raises a value error """
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user("", "test123")

    def test_create_superuser(self):
        """ Test Creating a SuperUser"""
        user = get_user_model().objects.create_superuser('test@example.com', "test123")

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_create_recipe(self):
        """test creating a recipe is successfull"""
        user = get_user_model().objects.create_user(
            'test@example.com', "test123"
        )
        recipe = models.Recipe.objects.create(
            user=user,
            title="Sample recipe name",
            time_minutes=5,
            price=Decimal('5.50'),
            description="Sample recipe description,"
        )
        self.assertEqual(str(recipe), recipe.title)

    def test_create_tag(self):
        """testing creating new tag"""
        user = create_user()
        tag = models.Tag.objects.create(user=user, name="Tag1")

        self.assertEqual(str(tag), tag.name)

    def test_create_ingredient(self):
        """Test creating an incgredient successful"""
        user = create_user()
        ingredient = models.Ingredient.objects.create(
            user=user,
            name="Ingredient1"
        )
        self.assertEqual(str(ingredient), ingredient.name)

    @patch("core.models.uuid.uuid4")
    def test_recipe_file_name(self, mock_uuid):
        """test generating image path"""
        uuid = 'test_uuid'
        mock_uuid.return_value = uuid
        file_path = models.recipe_image_file_path(None, 'example.jpg')

        self.assertEqual(file_path, f'uploads\\recipe\\{uuid}.jpg')
