using System.Web;
using System.Web.Optimization;

namespace Leaflet_Solution
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/bootstrap-colorpicker.css",
                      "~/Content/site.css",
                      "~/Content/font-awesome.css",
                      "~/Content/leaflet.css",
                      "~/Content/leaflet.draw.css",
                      "~/Content/Control.FullScreen.css",
                      "~/Content/Control.GeoJsonInfo.css"));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap/umd/popper.js",
                      "~/Scripts/bootstrap/bootstrap.js",
                      "~/Scripts/bootstrap/bootstrap-colorpicker.js"));

            bundles.Add(new ScriptBundle("~/bundles/leaflet").Include(
                      "~/Scripts/Leaflet/leaflet.js",
                      "~/Scripts/Leaflet/leaflet-draw.js",
                      "~/Scripts/Leaflet/Control.FullScreen.js",
                      "~/Scripts/Leaflet/leaflet-heat.js",
                      "~/Scripts/Leaflet/Control.GeoJsonInfo.js"));

            bundles.Add(new ScriptBundle("~/bundles/angular").Include(
                        "~/Scripts/angularJS/angular.js"));

            bundles.Add(new ScriptBundle("~/bundles/jscontrollers").Include(
                "~/Scripts/jsControllers/homecontroller.js"));
        }
    }
}
