const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
require('./database/dbcon.js');

const productModal = require('./model/productSchema.js');

app.use(express.json());
app.use(cors());

// get all products
app.get("/", async(req,res)=>{
  res.json("Welcome to Dashboard");
})

app.get("/productList", async (req, res) => {

  const { search,page,month} = req.query;
  console.log("search",search);
  console.log("month",month);
  console.log("page",page);

  const pageSize = 10;
  
  try 
  {
    let products = [];
    const productsArr = await productModal.find();
    if(search)
      {
          products = productsArr.filter(item => {
          return (
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.price.toString().includes(search)
          );
        });
        const totalPages = Math.ceil(products.length / pageSize);
        res.json({ products: products, totalPages });
      }
    else if(month)
    {
      productsArr.forEach((i)=>{
       let monthName = new Date(i.dateOfSale).getMonth()+1;
       if(monthName==month)
        {
            products.push(i);
        }
      });
  
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      const paginatedProducts = products.slice(startIndex, endIndex);
      const totalPages = Math.ceil(products.length / pageSize);
      res.json({ products: paginatedProducts, totalPages });
    }
    else
    {
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      const paginatedProducts = productsArr.slice(startIndex, endIndex);
      const totalPages = Math.ceil(productsArr.length / pageSize);
      res.json({ products: paginatedProducts, totalPages });
    }
  } 
  catch (err) 
  {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });


//  get statistics
// Total sale amount
app.get("/totalSale", async(req, res) => {

  const { month, year } = req.query;

  try 
  {
    const allProducts = await productModal.find();

    let sum = 0;
    let soldItems = [];
    let notSoldItems = [];
    allProducts.forEach((i)=>{
     let yearval = new Date(i.dateOfSale).getFullYear();
     let monthName = new Date(i.dateOfSale).getMonth()+1;
    if(monthName==month && yearval==year && i.sold==true)
     {
         sum+=i.price;
         soldItems.push(i);
     }
     else if(monthName==month && yearval==year && i.sold==false)
     {
        notSoldItems.push(i);
     }

});
    res.json({
      totalSale:sum,
      soldItems:soldItems.length,
      notSoldItems:notSoldItems.length,
      data:soldItems
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });

// price range

app.get("/priceRange", async (req, res) => {

  const { month } = req.query;
  try 
  {
    const allProducts = await productModal.find();
    let itemsInRange = 
      {
        Under100:[],
        Under200:[],
        Under300:[],
        Under400:[],
        Under500:[],
        Under600:[],
        Under700:[],
        Under800:[],
        Under900:[],
        Above900:[]
    };

    allProducts.forEach((i)=>{
     let monthName = new Date(i.dateOfSale).getMonth()+1;
      if(monthName==month && i.price>=0 && i.price<=100)
       {
          itemsInRange.Under100.push(i);
       }
       else if(monthName==month && i.price>=101 && i.price<=200)
       {
          itemsInRange.Under200.push(i);
       }
       else if(monthName==month && i.price>=201 && i.price<=300)
       {
          itemsInRange.Under300.push(i);
       }
       else if(monthName==month && i.price>=301 && i.price<=400)
       {
          itemsInRange.Under400.push(i);
          console.log("gap ",itemsInRange.Under400)
       }
       else if(monthName==month && i.price>=401 && i.price<=500)
       {
          itemsInRange.Under500.push(i);
       }
       else if(monthName==month && i.price>=501 && i.price<=600)
       {
          itemsInRange.Under600.push(i);
       }
       else if(monthName==month && i.price>=601 && i.price<=700)
       {
          itemsInRange.Under700.push(i);
       }
       else if(monthName==month && i.price>=701 && i.price<=800)
       {
          itemsInRange.Under800.push(i);
       }
       else if(monthName==month && i.price>=801 && i.price<=900)
       {
          itemsInRange.Under900.push(i);
       }
       else if(monthName==month && i.price>=901)
       {
          itemsInRange.Above900.push(i);
       }
  });
    res.json({data:
      {
        Under100:{
          range:"0-100",
          ItemCount:itemsInRange.Under100.length,
        },
        Under200:{
          range:"101-200",
          ItemCount:itemsInRange.Under200.length,
        },
        Under300:{
          range:"201-300",
          ItemCount:itemsInRange.Under300.length,
        },
        Under400:{
          range:"301-400",
          ItemCount:itemsInRange.Under400.length,
        },
        Under500:{
          range:"401-500",
          ItemCount:itemsInRange.Under500.length,
        },
        Under600:{
          range:"501-600",
          ItemCount:itemsInRange.Under600.length,
        },
        Under700:{
          range:"601-700",
          ItemCount:itemsInRange.Under700.length,
        },
        Under800:{
          range:"701-800",
          ItemCount:itemsInRange.Under800.length,
        },
        Under900:{
          range:"801-900",
          ItemCount:itemsInRange.Under900.length,
        },
        Above900:{
          range:"901",
          ItemCount:itemsInRange.Above900.length,
        },
      }}  
  );

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });

// category Count

app.get("/categoryCount", async (req, res) => {

  try {
    const allProducts = await productModal.find();
    let categories = {};
    allProducts.forEach((i,index)=>{
      if (categories[i.category] === undefined) 
      {
        console.log(index,i.category);
        categories[i.category] = 1;
      } 
      else {
        categories[i.category]++;
      }
  });
    res.json({data:categories});

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  });

  // combined data
  app.get('/combineAll', async (req, res) => {
    try {
      const totalSalePromise = getTotalSale(req.query.month, req.query.year);
      const priceRangePromise = getPriceRange(req.query.month);
      const categoryCountPromise = getCategoryCount();
  
      const [totalSaleResult, priceRangeResult, categoryCountResult] = await Promise.allSettled([totalSalePromise, priceRangePromise, categoryCountPromise]);
  
      if (totalSaleResult.status === 'rejected' || priceRangeResult.status === 'rejected' || categoryCountResult.status === 'rejected') {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      const combinedData = {
        totalSale: totalSaleResult.value,
        priceRange: priceRangeResult.value,
        categoryCount: categoryCountResult.value
      };
  
      res.json(combinedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });




  async function getTotalSale(month, year) {
    const allProducts = await productModal.find();
    let sum = 0;
    let soldItems = [];
    let notSoldItems = [];
    allProducts.forEach((i) => {
      let yearval = new Date(i.dateOfSale).getFullYear();
      let monthName = new Date(i.dateOfSale).getMonth() + 1;
      if (monthName == month && yearval == year && i.sold == true) {
        sum += i.price;
        soldItems.push(i);
      } else if (monthName == month && yearval == year && i.sold == false) {
        notSoldItems.push(i);
      }
    });
    return {
      totalSale: sum,
      soldItems: soldItems.length,
      notSoldItems: notSoldItems.length,
      data: soldItems
    };
  }
  



 async function getPriceRange(month) {
    const allProducts = await productModal.find();
    let itemsInRange = {
      Under100: [],
      Under200: [],
      Under300: [],
      Under400: [],
      Under500: [],
      Under600: [],
      Under700: [],
      Under800: [],
      Under900: [],
      Above900: []
    };
  
    allProducts.forEach((i) => {
      let monthName = new Date(i.dateOfSale).getMonth() + 1;
      if (monthName == month && i.price >= 0 && i.price <= 100) {
        itemsInRange.Under100.push(i);
      } else if (monthName == month && i.price >= 101 && i.price <= 200) {
        itemsInRange.Under200.push(i);
      } else if (monthName == month && i.price >= 201 && i.price <= 300) {
        itemsInRange.Under300.push(i);
      } else if (monthName == month && i.price >= 301 && i.price <= 400) {
        itemsInRange.Under400.push(i);
      } else if (monthName == month && i.price >= 401 && i.price <= 500) {
        itemsInRange.Under500.push(i);
      } else if (monthName == month && i.price >= 501 && i.price <= 600) {
        itemsInRange.Under600.push(i);
      } else if (monthName == month && i.price >= 601 && i.price <= 700) {
        itemsInRange.Under700.push(i);
      } else if (monthName == month && i.price >= 701 && i.price <= 800) {
        itemsInRange.Under800.push(i);
      } else if (monthName == month && i.price >= 801 && i.price <= 900) {
        itemsInRange.Under900.push(i);
      } else if (monthName == month && i.price >= 901) {
        itemsInRange.Above900.push(i);
      }
    });
  
    return {
      Under100: {
        range: "0-100",
        ItemCount: itemsInRange.Under100.length,
      },
      Under200: {
        range: "101-200",
        ItemCount: itemsInRange.Under200.length,
      },
      Under300: {
        range: "201-300",
        ItemCount: itemsInRange.Under300.length,
      },
      Under400: {
        range: "301-400",
        ItemCount: itemsInRange.Under400.length,
      },
      Under500: {
        range: "401-500",
        ItemCount: itemsInRange.Under500.length,
      },
      Under600: {
        range: "501-600",
        ItemCount: itemsInRange.Under600.length,
      },
      Under700: {
        range: "601-700",
        ItemCount: itemsInRange.Under700.length,
      },
      Under800: {
        range: "701-800",
        ItemCount: itemsInRange.Under800.length,
      },
      Under900: {
        range: "801-900",
        ItemCount: itemsInRange.Under900.length,
      },
      Above900: {
        range: "901",
        ItemCount: itemsInRange.Above900.length,
      },
    };
  }



 async function getCategoryCount() {
    const allProducts = await productModal.find();
    let categories = {};
    allProducts.forEach((i, index) => {
      if (categories[i.category] === undefined) {
        categories[i.category] = 1;
      } else {
        categories[i.category]++;
      }
    });
    return { data: categories };
  }




app.listen(5000,()=>{
  console.log("server is running on port 5000");
  console.log("Connection successfull");
});

