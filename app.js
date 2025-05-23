//Budget Controller
var budgetController = (function(){
    
   var Expense = function(id,description,value){
       this.id=id;
       this.description=description;
       this.value=value;
       this.percentage = -1;

   }

   Expense.prototype.calPercentage = function(totalIncome){
        if(totalIncome>0){
          this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
  
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

   var Income = function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
   }

  var calculateTotal=function(type){
     var sum = 0;
     data.allItems[type].forEach(function(curr){
         sum=sum+curr.value;
     });

     data.totals[type] = sum;
  };

   var data ={
    allItems:{
        exp:[],
        inc:[],
    } ,
    totals:{
        exp:0,
        inc:0
    },
    budget : 0,
    precentage : -1
   };

   return {
       addItem : function(type,des,val){
            
            var newItem,ID;
            //create unique id
            if(data.allItems[type].length>0)
              {
                ID=data.allItems[type][data.allItems[type].length-1].id+1;

              }
              else{

                ID=0;
              }
         //create new item based on type
          if(type==='exp'){
            newItem=new Expense(ID,des,val);
          }
          else if(type==='inc'){
              newItem = new Income(ID,des,val);
          }
          //push new element to array of type
          data.allItems[type].push(newItem);
          return newItem;
       },
       //deleting value from data structure in budgetCtrl
        deleteItem : function(type,id){
           var ids,index;
           //map method to make a copy of array elements
          ids = data.allItems[type].map(function(current){
              return current.id;
          });

          index= ids.indexOf(id);
          if(index!==-1){
              //splice method for deleting
              data.allItems[type].splice(index,1);
          }

        },
       calculateBudget : function(){
         //calc expenses and total income
         calculateTotal('exp');
         calculateTotal('inc');

       //calculate budget = inc-exp
       data.budget=data.totals.inc-data.totals.exp;

       //cal percentage of income spent as expense
           if (data.totals.inc > 0) {
             data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          }else {
                data.percentage = -1;
         }     
       },

       calculatePercentages: function() {
        
        data.allItems.exp.forEach(function(cur) {
           cur.calPercentage(data.totals.inc);
        });
    },
    
    
    getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
        });
        return allPerc;
    },

       getBudget: function(){
          return {
              budget: data.budget,
              totalInc : data.totals.inc,
              totalExp : data.totals.exp,
              percentage : data.percentage
          }
       },

       testing : function(){
           console.log(data);
       }
   }
})();


//UI Controller
var UIController = (function(){

    var DOMstrings={
        inputType:'.add__type',
        inputDescription : '.add__description',
        inputValue:'.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
   var formatNumber = function(num,type){
        var numSplit,int,dec;

          num = Math.abs(num);
          //toFixed method from number prototype for 2 decimal digits
          //converts primitive to object
          num = num.toFixed(2);

          numSplit=num.split(".");
          
          int = numSplit[0];
          if(int.length>3){
             int = int.substr(0,int.length-3) +','+int.substr(int.length-3,3);
          }

          dec = numSplit[1];

          
          return  (type==='exp'?sign= '-':sign='+')+ ' '+int+'.'+dec;
      };

      var nodeListForEach = function(list,callback){
                 
        for(var i=0;i<list.length;i++){
           callback(list[i],i);
        }

      };
  
     return{
       getInput : function(){
           return {
             type : document.querySelector(DOMstrings.inputType).value,
             description : document.querySelector(DOMstrings.inputDescription).value,
             value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
       
           }
         },

         addListItem : function(obj,type){
            var html,newHtml,element;
            if(type==='inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
            else if(type==='exp'){
                element=DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
          
        newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
          
        //adding elemet before end DOM
        
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //delete item from UI
        //we remove the child only in JS
        deleteListItem : function(selectorID){

            //removing child from parent DOM
            var el=document.getElementById(selectorID);
             el.parentNode.removeChild(el);
        },
        

     // clearing set fields 
        clearFields : function(){
         
            var fields,fieldsArr;
          fields = document.querySelectorAll(DOMstrings.inputDescription + ','+ DOMstrings.inputValue);
          //converting list to array
          fieldsArr =  Array.prototype.slice.call(fields);
          
          fieldsArr.forEach(function(current,index,array){
              current.value = "";
          });
          //changing the focus to a specific field
          fieldsArr[0].focus(); 
        },

        displayBudget : function(obj){
             var type;
          obj.budget>0 ?type = 'inc' :'exp';

           document.querySelector(DOMstrings.budgetLabel).textContent= formatNumber(obj.budget,type);
           document.querySelector(DOMstrings.incomeLabel).textContent= formatNumber(obj.totalInc,'inc');
           document.querySelector(DOMstrings.expensesLabel).textContent= formatNumber(obj.totalExp,'exp');
           
           if(obj.percentage>0){
            document.querySelector(DOMstrings.percentageLabel).textContent= obj.percentage+'%';
           }
           else{
            document.querySelector(DOMstrings.percentageLabel).textContent= '---';

           }

        },
        //display percentages for individual item
         displayPercentages : function(percentages){
              var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
              //creating our own forEach for nodelist
              //callback
              
              nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                 }
                 else{
                     current.textContent = '---';
                 } 
              });

             
              
         },
          //date object 
         displayMonth : function(){
             var now,year,month,months;
               
             months=['January','February','March','April','May','June','July','August','September','October','November','December'];

               now=new Date();
               month = now.getMonth();
               year = now.getFullYear();
               document.querySelector(DOMstrings.dateLabel).textContent=months[month] + ' '+year;
         },
            //adding css
         changeType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType+','+ 
                DOMstrings.inputDescription + ','+
                DOMstrings.inputValue);

                nodeListForEach(fields,function(cur){
                   cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
         },

         getDOMstrings : function(){
             return DOMstrings;
         }
    };

})();

//Gloabl App Controller 
var controller = (function(budgetCtrl,UICtrl){

    var setupEventListeners = function(){
        var DOM=UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlADDItem);
        document.addEventListener('keypress',function(event){
         if(event.keyCode===13 || event.which===13){
             ctrlADDItem();
         }
           
        });
           document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
            
           document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
        };

      var updateBudget = function(){
          //cal budget
           budgetCtrl.calculateBudget();
          //return budget

          var budget =budgetCtrl.getBudget();
          UICtrl.displayBudget(budget);
   };


      var updatePercentages = function(){
          //calculate percentages
            budgetCtrl.calculatePercentages();
          //read percentages from budget controller
           var percentages =  budgetCtrl.getPercentages();
           
           //display percentages on UI
           UICtrl.displayPercentages(percentages );
           
      };

      var ctrlADDItem=function(){
          var input,newItem;
        //get the field input
           input =UICtrl.getInput();
           if(input.description!=="" &&  !isNaN(input.value) && input.value>0){
        //add the item to the budgetCtroller
            newItem= budgetCtrl.addItem(input.type,input.description,input.value);
        //add the item to list
            UICtrl.addListItem(newItem,input.type);

        //clear fields
            UICtrl.clearFields();

        //calculate and update budget
            updateBudget();
        //calculate and update percentages
            updatePercentages();
           }
      };
      //deleting the list item
      var ctrlDeleteItem = function(event){
          var itemID,splitID,type,ID;

          //dom traversal and event bubbling,event delegation
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
       if(itemID){
           
        splitID = itemID.split('-');
        type=splitID[0];
        ID=parseInt(splitID[1]);
        //deleting item from data structure 
        budgetCtrl.deleteItem(type,ID);

        //delete item from UI
        UICtrl.deleteListItem(itemID);
        
        //update new budget
         updateBudget();
        //calculate and update percentages
         updatePercentages();
       }
    };

    return{
        init:function(){
            console.log("Application has started:");
             UICtrl.displayMonth();
            UICtrl.displayBudget({
              budget: 0,
              totalInc : 0,
              totalExp : 0,
              percentage : -1
          });
             setupEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();