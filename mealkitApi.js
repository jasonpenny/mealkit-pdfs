const fs = require("fs");

const TOKEN_PATH = "./token.txt";

const captureTokenToFile = async (email, password) => {
  const resp = await fetch(
    'https://api.dinnerly.com/login?ios_appbuild=2&ios_model=iPhone&brand=dn&country=us&client_id=ios&ios_appversion=3.12.3&ios_osversion=15.6.1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ brand: "dn", email, password })
    }
  );

  const data = await resp.json();

  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
  fs.writeFileSync(TOKEN_PATH, data.api_token);
};

const getCurrentOrder = async (email, password) => {
  const query = `
query GetCurrentOrder_iOS($first: Int!, $after: Int, $scope: OrderScopeEnum, $imageSize: ImageSizeEnum!, $sortDirection: SortDirection!) {
  customer: me {
    orders(
      first: $first
      after: $after
      scope: $scope
      sortDirection: $sortDirection
    ) {
      id
      contents {
        uncookedRecipes: recipes(state: UNCOOKED) {
          ...OrderRecipeDetails
        }
      }
    }
  }
}
fragment OrderRecipeDetails on OrderRecipe {
  id
  ...RecipeDetails
}
fragment RecipeDetails on RecipeInterface {
  id
  title
  subtitle
  image(size: $imageSize) {
    url
  }
  duration {
    ...RecipeDuration
  }
  shippedIngredients {
    ...ShippedIngredientDetails
  }
  assumedIngredients {
    ...AssumedIngredientDetails
  }
  steps {
    ...RecipeStepDetails
  }
  utensils {
    ...UtensilDetails
  }
}
fragment RecipeDuration on RecipeDuration {
  from
  to
  unit
}
fragment ShippedIngredientDetails on ShippedIngredient {
  nameWithQuantity
  image(size: $imageSize) {
    url
  }
}
fragment AssumedIngredientDetails on AssumedIngredient {
  name
}
fragment RecipeStepDetails on RecipeStep {
  title
  description
  image(size: $imageSize) {
    url
  }
}
fragment UtensilDetails on Utensil {
  name
}
  `;
  const variables = {
    "after": null,
    "first": 1,
    "imageSize": "LARGE",
    "scope": "UP_TO_TODAY",
    "sortDirection": "DESC",
  };

  if (!fs.existsSync(TOKEN_PATH)) {
    await captureTokenToFile(email, password);
  }
  const token = fs.readFileSync(TOKEN_PATH, { encoding: "utf8", flag: "r" });

  const raw = await fetch('https://api.dinnerly.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    })
  });

  const data = await raw.json();
  return data;
}

exports.getCurrentOrder = getCurrentOrder;
