var  express                = require("express"),
     app                    = express(),
     mongoose               = require("mongoose"),
     passport               = require("passport"),
     bodyParser             = require("body-parser"),
     User                   = require("./models/user"),
     LocalStrategy          = require("passport-local"),
     passportLocalMongoose  = require("passport-local-mongoose"),
     uniqueValidator = require('mongoose-unique-validator');
     let {PythonShell} = require('python-shell')
    
    
//mongoose.connect("mongodb://localhost/beprojdb", { useNewUrlParser: true });    

const URI = require("./dbURI");
mongoose.connect(URI,{ useNewUrlParser: true })

//1. Generate random no for unique question paper
var genrandnoschema=new mongoose.Schema({
    randno: Number
});

var genrandnomodel=mongoose.model("genrandnomodel",genrandnoschema);

//2. Store student marks scored in MCQ test
var mcqstudentmarksschema=new mongoose.Schema({
    testid:String,
    studentid:String,
    mcqstudentmarks:Number,
    outofmcqweigthage:Number
});

var mcqstudentmarksmodel=mongoose.model("mcqstudentmarksmodel",mcqstudentmarksschema);

//3. Store student MCQ answers
var mcqansschema=new mongoose.Schema({
    testid:String,
    studentid:String,
    mcqanswer:Array
});

var mcqansmodel=mongoose.model("mcqansmodel",mcqansschema);

//4. Store student marks scored in TnF test
var tnfstudentmarksschema=new mongoose.Schema({
    testid:String,
    studentid:String,
    tnfstudentmarks:Number,
    outoftfweigthage:Number
})

var tnfstudentmarksmodel=mongoose.model("tnfstudentmarksmodel",tnfstudentmarksschema);

//5. Store student TnF answers
var tnfansschema=new mongoose.Schema({
    testid:String,
    studentid:String,
    tnfanswer:Array,
    })

var tnfansmodel=mongoose.model("tnfansmodel",tnfansschema);

//6. TnF question paper set by teacher
var tnfschema = new mongoose.Schema({
    testid :String,
     tnfquestion : String,
    tnfoption:String,
     tnfweightage:Number
});

var tnfmodel=mongoose.model("tnfmodel",tnfschema);

//7. MCQ question paper set by teacher
var mcqschema = new mongoose.Schema({
    testid :String,
    mcqquestion : String,
    mcqoptionone:String,
    mcqoptiontwo:String,
    mcqoptionthree:String,
    mcqoptionfour:String,
    mcqcorrectoption:Number,
    mcqweightage:Number
});

var mcqmodel=mongoose.model("mcqmodel",mcqschema);

//8. Des question paper set by teacher
var descschema = new mongoose.Schema({
    testid :String,
    descquestion : String,
    modalanswer:String,
    desckeywords:Array,
    descweightage:Number
});

var descmodel=mongoose.model("descmodel",descschema);

//9. Blog schema
var blogschema=new mongoose.Schema({
    usernameblog:String,
    paperidblog:Number,
    commentblog:String
});

var blogmodel=mongoose.model("blogmodel",blogschema);

var descansschema=new mongoose.Schema({
    testid:String,
    studentid:String,
    descstudentanswer:Array,
    marks:Number
    })

var descansmodel=mongoose.model("descansmodel",descansschema);

var pname=new mongoose.Schema({
    teachername:String,
    testname:String,
    // testid:{type: Number,unique: true, required: true}
     testid: Number,
     paperduration:Number
    });
    
// pname.plugin(uniqueValidator);
var qpname = mongoose.model("qpname",pname);   

var qpaper=new mongoose.Schema({
    papername:String,
    qtype: Number,
    marks:Number,
    question:String,
    uname:String
    });
var qp = mongoose.model("qp",qpaper);   

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============
// ROUTES
//============

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var normalizedPath = require("path").join(__dirname, '/routes');
app.use(express.static(normalizedPath));

app.get("/", function(req, res){
    res.render("comingsoon");
});

// Auth Routes

//show sign up form
app.get("/register", function(req, res){
   res.render("register"); 
});

app.post("/register", function(req, res){
    var newuser=new User({username: req.body.username}),
    registerdob=req.body.registerdob,
    registeremail=req.body.registeremail,
    registerpid=req.body.registerpid;
        User.register(newuser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
          res.redirect("tnslogin");
        });
    });
});

// LOGIN ROUTES  // render login form

app.get("/login", function(req, res){
  res.render("login.ejs"); 
});

//login logic //middleware

app.post("/login", passport.authenticate("local", {
    successRedirect: "/tnslogin",
    failureRedirect: "/login"
}) ,function(req, res){
});

//tns=teacher and student


app.get("/tnslogin",isLoggedIn, function(req, res){
    var username1=req.user.username;
    if(username1[0]=='s'){
        res.redirect("/studenthomepage");
    }else{
      res.redirect("/teacherhomepage"); 
        
    }
});

app.get("/studenthomepage",isLoggedIn,function(req, res){
    var xy=req.user.username;
          qpname.find({}, function(err, papername){
      if(err){
          console.log(err);
      } else {
        //res.render("studenthomepage",{uname:xy,allqps:papername});    
              tnfansmodel.find({studentid:xy}, function(err, attemptpaper){
      if(err){
          console.log(err);
      } else { console.log(attemptpaper);console.log(typeof(attemptpaper));
               res.render("studenthomepage",{uname:xy,allqps:papername,attemptpaper:attemptpaper});    }
    });
             }
    });
    });
     
app.get("/studentgivepaperinst/:testid", function(req, res){
     var testid=req.params.testid;
     res.render("studentgivepaperinst.ejs",{uname:req.user.username,testid,testid})
});
app.get("/studentgivepaper/:testid", function(req, res){
     var testid=req.params.testid;
         qpname.find({testid:testid}, function(err, pd){
      if(err){
          console.log(err);
      } else {  
         res.render("studentgivepaper.ejs",{uname:req.user.username,testid:testid,paperdur:pd}); }
    });
});
app.get("/thankyou", function(req, res){
           res.render("thankyou"); 
   });

app.get("/studentgivepaper/:testid/tnfqp", function(req, res){
    var testid=req.params.testid;
     qpname.find({testid:testid}, function(err, pd){
      if(err){
          console.log(err);
      } else {  
              tnfmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("studentgivepapertnf.ejs",{uname:req.user.username,testid:testid,allqps:allqp,paperdur:pd}) }
    });  }
    });
   });
app.post("/studentgivepaper/:testid/tnfqp", function(req, res){
  var tnfanswer=req.body.tnfanswer;
  var studentid=req.user.username;
  var testid=req.params.testid;
  var dbtfweigthage=0;
  var outoftfweigthage=0;
  var j=0;
  var tnfans = { testid:testid,studentid:studentid,tnfanswer:tnfanswer};
  
      tnfmodel.find({testid:testid}, function(err, allqp){
           if(err){
             console.log(err);
           } else {
         
            console.log(typeof(tnfanswer))
            for(var i=0;i<tnfanswer.length;i++){
             for(j=i;j<=i;j++){
              
             if(tnfanswer[i]==allqp[j].tnfoption)
                  {
                      dbtfweigthage += allqp[j].tnfweightage;
                      outoftfweigthage +=allqp[i].tnfweightage;
                  } else
                  {
                      dbtfweigthage += 0;
                       outoftfweigthage +=allqp[i].tnfweightage;
                  }      
                       }      
                  }
        var tnfstudentmarks=dbtfweigthage;  
        var tnfstudentweightage=outoftfweigthage; 
         
       var tsmm={testid:testid,studentid:studentid,tnfstudentmarks:tnfstudentmarks,outoftfweigthage:tnfstudentweightage};
        tnfstudentmarksmodel.create(tsmm, function(err, x){
        if(err){
            console.log(err);
        } else {
             tnfansmodel.create(tnfans, function(err, qp){
        if(err){
            console.log(err);
        } else {console.log(allqp);
           res.render("studentgivepapertnfresult",{ans:qp,mks:x,allqp:allqp,uname:req.user.username,testid:testid,outoftfweigthage:outoftfweigthage});
        }
       });
    }
       });
             }
           });
    
  });

app.get("/studentgivepaper/:testid/mcqqp", function(req, res){
       var testid=req.params.testid;
                qpname.find({testid:testid}, function(err, pd){
      if(err){
          console.log(err);
      } else { 
          mcqmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("studentgivepapermcq.ejs",{uname:req.user.username,testid:testid,allqps:allqp,paperdur:pd}) }
    });    }
    });
   
   });
app.post("/studentgivepaper/:testid/mcqqp", function(req, res){
    
    // get data from form and add to campgrounds array
  var mcqanswer=req.body.mcqanswer;
  var studentid=req.user.username;
  var testid=req.params.testid;
  var dbtfweigthage=0;
  var j=0;
  var outofmcqweigthage=0;
  var mcqans = { testid:testid,studentid:studentid,mcqanswer:mcqanswer};
      mcqmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         
        console.log(typeof(mcqanswer));
        for(var i=0;i<mcqanswer.length;i++){
             for(j=i;j<=i;j++){
              
             if(mcqanswer[i]==allqp[j].mcqcorrectoption)
                  {
                      dbtfweigthage += allqp[j].mcqweightage;
                      outofmcqweigthage +=allqp[i].mcqweightage;
                  } else
                  {
                      dbtfweigthage += 0; outofmcqweigthage +=allqp[i].mcqweightage;
                  }      
                       }      
                  }
        var mcqstudentmarks=dbtfweigthage;  
        var mcqstudentweightage=outofmcqweigthage; 
       var tsmm={testid:testid,studentid:studentid,mcqstudentmarks:mcqstudentmarks,outofmcqweigthage:mcqstudentweightage};
        mcqstudentmarksmodel.create(tsmm, function(err, x){
        if(err){
            console.log(err);
        } else {
              mcqansmodel.create(mcqans, function(err, qp){
        if(err){
            console.log(err);
        } else {
           res.render("studentgivepapermcqresult",{ans:qp,mks:x,allqp:allqp,uname:req.user.username,testid:testid,outofmcqweigthage:outofmcqweigthage});
        }
    });
            
          }
    });
      
      }
           });
    
});

app.get("/studentgivepaper/:testid/descqp", function(req, res){
      var testid=req.params.testid;
     qpname.find({testid:testid}, function(err, pd){
      if(err){
          console.log(err);
      } else {  
              descmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("studentgivepaperdescqp.ejs",{uname:req.user.username,testid:testid,allqps:allqp,paperdur:pd}) }
    });  }
    });
   });


app.post("/studentgivepaper/:testid/descqp", function(req, res){
  var descstudentanswer=req.body.descstudentanswer;
  var studentid=req.user.username;
  var testid=req.params.testid;

 descmodel.find({testid:testid},function(err, teacherAnswer){
      //console.log(teacherAnswer);
                let options = {
            mode: 'text',
            scriptPath: 'python_code',
            pythonOptions: ['-u'], // get print results in real-time
            args: [teacherAnswer[0].modalanswer,teacherAnswer[0].desckeywords,descstudentanswer,teacherAnswer[0].descweightage]
        };
                PythonShell.run('givVal.py', options, function (err,results) {
                    if (err) throw err;
                    console.log(results);
                    var descans = { testid:testid,studentid:studentid,descstudentanswer:descstudentanswer,marks:results[0]};
                     descansmodel.create(descans, function(err, qp){
                    if(err){
                        console.log(err);
                    } else {
                            responseText = "you have scored : " + results[0] ;
                            res.send(responseText);
                            
                            };
                        });
                    
        });
  });

//   let options = {
//     mode: 'text',
//     scriptPath: './python_code',
//     pythonOptions: ['-u'], // get print results in real-time
//     args: ['database managment']
//   };

//   PythonShell.run('givVal.py', options, function (err,results) {
//     if (err) throw err;
//     console.log(results);
//     res.send(results);
//   });
  
  
        //     descansmodel.create(descans, function(err, qp){
        // if(err){
        //     console.log(err);
        // } else {
        //    res.render("thankyou")};
        //     });
  });

app.get("/teacherhomepage",isLoggedIn, function(req, res){
      var xy=req.user.username;
      
      var randno=Math.floor((Math.random() * 9999) + 10000);
      var randnopresent=0;
      
    genrandnomodel.find({}, function(err, no){
    if(err)  {      console.log(err);    }
    else     {      for(var i=0;i<no.length;i++)
             {    if(no[i]==randno)
                 {   fgenrandno(randno); 
                     break; 
                 }      
                 else 
                 {randnopresent=1;
                 }
             }
         if(randnopresent==1) 
         {  var randnon={randno:randno};
            genrandnomodel.create(randnon, function(err, qhp){
             if(err){ console.log(err);  } else {}
          });
         }     }
    });
                function fgenrandno(randno){
            randno=Math.floor((Math.random() * 9999) + 10000);
            var randnon={randno:randno};
           genrandnomodel.create(randnon, function(err, qhp){
          if(err){console.log(err); }   else {}
    });
    } //fgenrandno loop end here
        
        
     qpname.find({teachername:xy}, function(err, papername){
      if(err){
          console.log(err);
      } else {
          res.render("teacherhomepage",{uname:req.user.username,allqps:papername,testidin:randno});      }
    });
    });
    
app.post("/teacherhomepage", function(req, res){
    // get data from form and add to campgrounds array
    var  testname=req.body.testname;
    var teachername=req.user.username;
    var testid=req.body.testid;
    var paperduration=req.body.paperduration;
    var paper = { testname:testname,teachername:teachername,testid:testid,paperduration:paperduration};
        // Create a new campground and save to DB
    qpname.create(paper, function(err, qp){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            // res.render("home.ejs");
             res.redirect("/teacherhomepage");
        }
    });
});

app.get("/teachersetpaper/:testid", function(req, res){
    // Get all papers from DB
     var  xy=req.user.username;
  
if(xy[0]!=='s') {
    var testid=req.params.testid;
    //   res.send("dfgdf")
//   res.render("teachersetpaper.ejs",{uname:req.user.username,testid:testid})
  
  //extra code
  tnfmodel.find({testid:testid}, function(err, allqp){
      if(err){   console.log(err);
      } else { mcqmodel.find({testid:testid}, function(err, allqp1){
      if(err){          console.log(err);
      } else {    res.render("teachersetpaper.ejs",{uname:req.user.username,testid:testid,allqps:allqp,allqps1:allqp1}) }    });
  //extra code ends 
  }    });
} else {
      res.redirect("/login");
  }
  
});

app.get("/teachersetpaper/:testid/tnfqp", function(req, res){
    // Get all papers from DB
     var  xy=req.user.username;
  if(xy[0]!=='s') {

     var testid=req.params.testid;
              tnfmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("teachersetpapertnf.ejs",{uname:req.user.username,testid:testid,allqps:allqp})   }
    });
  } else {
      res.redirect("/login");
  }
   
});
app.post("/teachersetpaper/:testid/tnfqp", function(req, res){
    // get data from form and add to campgrounds array
    var testid=req.params.testid; 
    var  tnfquestion=req.body.tnfquestion;
    var tnfoption=req.body.tnfoption;
    var tnfweightage=req.body.tnfweightage;
    
    var tnf = { testid:testid,tnfquestion:tnfquestion,tnfoption:tnfoption,
    tnfweightage:tnfweightage};
        // Create a new campground and save to DB
    tnfmodel.create(tnf, function(err, qp){
        if(err){
            console.log(err);
        } else {
            //   res.redirect("/teachersetpaper/:testid/tnfqp");
            // res.render("teachersetpapertnf.ejs",{uname:req.user.username,testid:testid})
             tnfmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("teachersetpapertnf.ejs",{uname:req.user.username,testid:testid,allqps:allqp})   }
    });
        }
    });
});

app.get("/teachersetpaper/:testid/mcqqp", function(req, res){
    // Get all papers from DB
     var  xy=req.user.username;
  
if(xy[0]!=='s') {

     var testid=req.params.testid;
              mcqmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("teachersetpapermcq.ejs",{uname:req.user.username,testid:testid,allqps:allqp})   }
    });
} else {
      res.redirect("/login");
  }
   
});
app.post("/teachersetpaper/:testid/mcqqp", function(req, res){
    // get data from form and add to campgrounds array
    var testid=req.params.testid;
    var  mcqquestion=req.body.mcqquestion;
    var mcqoptionone=req.body.mcqoptionone;
    var mcqoptiontwo=req.body.mcqoptiontwo;
    var mcqoptionthree=req.body.mcqoptionthree;
    var mcqoptionfour=req.body.mcqoptionfour;
     var mcqcorrectoption=req.body.mcqcorrectoption; 
     var mcqweightage=req.body.mcqweightage;
    
    var mcq = { testid:testid,mcqquestion:mcqquestion,mcqoptionone:mcqoptionone,mcqoptiontwo:mcqoptiontwo,
    mcqoptionthree:mcqoptionthree,mcqoptionfour:mcqoptionfour,
    mcqcorrectoption:mcqcorrectoption,mcqweightage:mcqweightage };
        // Create a new campground and save to DB
    mcqmodel.create(mcq, function(err, qp){
        if(err){
            console.log(err);
        } else {
            //   res.redirect("/teachersetpaper/:testid/tnfqp");
            // res.render("teachersetpapertnf.ejs",{uname:req.user.username,testid:testid})
             mcqmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("teachersetpapermcq.ejs",{uname:req.user.username,testid:testid,allqps:allqp})   }
    });
        }
    });
});

app.get("/teachersetpaper/:testid/descqp", function(req, res){
  var  xy=req.user.username;
  if(xy[0]!=='s') {
     var testid=req.params.testid;
     
     descmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
          res.render("teachersetpaperdescqp.ejs",{uname:xy,testid:testid,allqps:allqp})   ;  }
    });       } else {
      res.redirect("/login");  }});
app.post("/teachersetpaper/:testid/descqp", function(req, res){
    // get data from form and add to campgrounds array
    var testid=req.params.testid; 
    var descquestion=req.body.descquestion;
    var modalanswer = req.body.modalanswer;
    var desckeywords=req.body.desckeywords;
    var descweightage=req.body.descweightage;
    desckeywords=desckeywords.split(",");
    var desc= { testid:testid,descquestion:descquestion,modalanswer:modalanswer,desckeywords:desckeywords, descweightage:descweightage};
      descmodel.create(desc, function(err, qp){
        if(err){
            console.log(err);
        } else {
             descmodel.find({testid:testid}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("teachersetpaperdescqp.ejs",{uname:req.user.username,testid:testid,allqps:allqp})   }
    });
        }
    });
});

app.get("/getstudentresults", function(req, res){
  var  xy=req.user.username;
  if(xy[0]!=='s') {
  qpname.find({teachername:xy}, function(err, papername){
      if(err){
          console.log(err);
      } else {
          res.render("getstudentresults",{uname:req.user.username,allqps:papername});      }
    });
  } else {
      res.redirect("/login");
  }
   
});
app.get("/getstudentresultsgraph/:testid", function(req, res){
  var testid=req.params.testid;var lenn = 0;var a=0,b=0,c=0;
     tnfstudentmarksmodel.find({testid:testid}, function(err, tnfmarks){
      if(err){
          console.log(err);
      } else {
          mcqstudentmarksmodel.find({testid:testid}, function(err, mcqmarks){
      if(err){
          console.log(err);
      } else {  
      console.log(mcqmarks.length);console.log(typeof(mcqmarks));
                lenn=mcqmarks.length;
        a=tnfmarks[lenn-1].outoftfweigthage;console.log(a);b=mcqmarks[lenn-1].outoftfweigthage;console.log(b); c=a+b;console.log(c);    
        descansmodel.find({testid:testid}, function(err, descmarks){
            if(err){
                console.log(err);
            } else { lennn=descmarks.length;console.log(lennn);console.log(descmarks[2].marks);
        res.render("getstudentresultsgraph",{uname:req.user.username,tnfmarks:tnfmarks,mcqmarks:mcqmarks,lenn:lenn,descmarks:descmarks});     }
    });}
});
      }
    });
 });
app.get("/getstudentclassresults/:testid", function(req, res){
var testid=req.params.testid;var lenn = 0;
     tnfstudentmarksmodel.find({testid:testid}, function(err, tnfmarks){
      if(err){
          console.log(err);
      } else {
          mcqstudentmarksmodel.find({testid:testid}, function(err, mcqmarks){
      if(err){
          console.log(err);
      } else { console.log(mcqmarks.length);console.log(typeof(mcqmarks));
                lenn=mcqmarks.length;
          res.render("getstudentclassresults",{uname:req.user.username,tnfmarks:tnfmarks,mcqmarks:mcqmarks,lenn:lenn});     }
    });
      }
    });
 });
 
app.get("/getstudentresultsanssheet/:testid", function(req, res){
    var testid=req.params.testid;
 
     tnfansmodel.find({testid:testid}, function(err, students){
      if(err){
          console.log(err);
      } else {
          res.render("getstudentresultsanssheet",{uname:req.user.username,testid:testid,students:students});     }
    });
});

app.get("/getstudentresultsanssheet/:testid/:studentid/tnf", function(req, res){
    var  xy=req.user.username;
    var testid=req.params.testid; 
    var studentid=req.params.studentid;
     tnfmodel.find({testid:testid}, function(err, tnfx1){
      if(err){
          console.log(err);
      } else {
                tnfansmodel.findOne({testid:testid,studentid:studentid}, function(err, tnfx2){
      if(err){
          console.log(err);
      } else {
          tnfstudentmarksmodel.findOne({testid:testid,studentid:studentid}, function(err, tnfx3){
      if(err){
          console.log(err);
      } else {
            console.log(tnfx2);
            console.log(tnfx3);
        res.render("getstudentresultsanssheettnf",{uname:xy,testid:testid,studentid:studentid,tnfx1:tnfx1,tnfx2:tnfx2,tnfx3:tnfx3});
             }
    });
             }
    });
             }
    });
    
});
app.get("/getstudentresultsanssheet/:testid/:studentid/mcq", function(req, res){
    var  xy=req.user.username;
    var testid=req.params.testid; 
    var studentid=req.params.studentid;
     mcqmodel.find({testid:testid}, function(err, mcqx1){
      if(err){
          console.log(err);
      } else {
            mcqansmodel.findOne({testid:testid,studentid:studentid}, function(err, mcqx2){
      if(err){
          console.log(err);
      } else {
          mcqstudentmarksmodel.findOne({testid:testid,studentid:studentid}, function(err, mcqx3){
      if(err){
          console.log(err);
      } else {
            console.log(mcqx2);
            console.log(mcqx3);
        res.render("getstudentresultsanssheetmcq",{uname:xy,testid:testid,studentid:studentid,mcqx1:mcqx1,mcqx2:mcqx2,mcqx3:mcqx3});
             }
    });
             }
    });
             }
    });    
});

app.get("/blog", function(req, res){
    
   qpname.find({}, function(err, pname){
      if(err){
          console.log(err);
      } else { 
    blogmodel.find({}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
         res.render("blog",{uname:req.user.username,allqps:allqp,pname:pname});}
    });       }
    });
  
});
app.post("/blog", function(req, res){
    // get data from form and add to campgrounds array
    var  usernameblog=req.user.username;
    var paperidblog=req.body.paperidblog;
    var commentblog=req.body.commentblog;
    var blog = { usernameblog:usernameblog,paperidblog:paperidblog,commentblog:commentblog};
        // Create a new campground and save to DB
    blogmodel.create(blog, function(err, qp){
        if(err){
            console.log(err);
        } else {
               res.redirect("/blog");
        }
    });
});

app.post("/query", function(req, res){
    var  dqp=req.body.dqp;
          qp.findOneAndDelete({papername:dqp}, function(err,dqp){
      if(err){
          console.log(err);
      } else {
          res.render("query.ejs",{allqps:dqp}); 
                } 
          });
    });
app.get("/query", function(req, res){
    // Get all papers from DB
  qp.find({}, function(err, allqp){
      if(err){
          console.log(err);
      } else {
          res.render("query.ejs",{allqps:allqp});      }
    });
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
   if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
//process.env.PORT
app.listen(3000, process.env.IP, function(){
    console.log("server started.......");
})