using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace webapp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "AL - Cloud Platform demo app.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Automation Logic";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
