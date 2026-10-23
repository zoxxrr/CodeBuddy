export const paths = [
  { id: "foundations", title: "Luau Foundations", level: "Beginner", description: "Learn to think in code, one clear step at a time.", color: "violet" },
  { id: "roblox", title: "Roblox Studio", level: "Beginner", description: "Understand the engine, its objects, and where scripts run.", color: "blue" },
  { id: "systems", title: "Game Systems", level: "Intermediate", description: "Build interfaces, progression, combat, and reusable features.", color: "cyan" },
  { id: "engineering", title: "Engineering & Security", level: "Advanced", description: "Design reliable, secure, and performant experiences.", color: "orange" }
];

export const lessons = [
  {
    id: "hello-luau", path: "foundations", order: 1, title: "Your first Luau program", duration: "8 min", difficulty: "Beginner", xp: 40, tags: ["print", "output"],
    intro: "A program is a set of instructions a computer follows. Luau is Roblox's scripting language, based on Lua and extended for Roblox development.",
    why: "Printing a message is the quickest way to see a script run. Output is also one of your most useful debugging tools.",
    example: 'print("Hello, Roblox!")',
    lines: [
      ["print", "Calls Luau's built-in print function."],
      ['"Hello, Roblox!"', "A string: text surrounded by quotation marks."],
      ["()", "Parentheses pass the message into the function."]
    ],
    exercise: { prompt: "Write a print statement that outputs the exact text CodeBuddy is awesome!", starter: 'print("...")', hint: "Put the sentence inside quotation marks and pass it to print(...).", checks: ["print-call", "contains-text"], expectedText: "CodeBuddy is awesome!", solution: 'print("CodeBuddy is awesome!")' },
    quiz: { question: "What is print() mainly useful for?", options: ["Creating a 3D part", "Displaying a value in Output", "Saving player data"], answer: 1, explanation: "print() displays values in Output, which is useful for learning and debugging." },
    mistakes: ["Forgetting quotation marks around text.", "Using mismatched quotation marks.", "Expecting print() to create something in the 3D world."],
    studio: "In Roblox Studio, create a Script inside ServerScriptService, paste the example, press Play, and look at the Output window.",
    summary: "print() displays values in Output. Text values are strings and need quotation marks.",
    reviewDays: 1
  },
  {
    id: "variables", path: "foundations", order: 2, title: "Variables: giving information a name", duration: "10 min", difficulty: "Beginner", xp: 50, tags: ["local", "strings", "numbers"],
    intro: "A variable is a named place to keep a value so you can reuse it. In Luau, local variables are usually the right default.",
    why: "Variables let a game remember things while a script runs, such as a player's speed, a round timer, or a chosen item.",
    example: 'local coins = 25\nlocal playerName = "Nova"\nprint(playerName, coins)',
    lines: [["local", "Declares a local variable whose scope is limited."], ["coins = 25", "Stores the number 25 under the name coins."], ['playerName = "Nova"', "Stores a string."], ["print(playerName, coins)", "Prints both values."]],
    exercise: { prompt: "Create a local variable named coins with the value 25, then print coins.", starter: "local coins = 0\nprint(coins)", hint: "Change the assigned number to 25. Keep the local declaration.", checks: ["local-coins-25", "print-coins"], solution: "local coins = 25\nprint(coins)" },
    quiz: { question: "Which declaration is a good default for a variable used only in this script scope?", options: ["local coins = 25", "coins := 25", "var coins == 25"], answer: 0, explanation: "Luau uses local to declare a local variable." },
    mistakes: ["Using == when you mean assignment with =.", "Forgetting that text needs quotes.", "Reusing a name for a different purpose and making the code harder to read."],
    studio: "Create a variable called walkSpeed and print it. Then change its value and run the script again.",
    summary: "Use local to declare variables. Values can be numbers, strings, booleans, tables, and more.",
    reviewDays: 1
  },
  {
    id: "types-nil", path: "foundations", order: 3, title: "Values and data types", duration: "12 min", difficulty: "Beginner", xp: 50, tags: ["types", "nil", "boolean"],
    intro: "A value has a type that describes what kind of information it represents. Common Luau types include number, string, boolean, and nil.",
    why: "Understanding types helps you predict what operations make sense and why a confusing error happens.",
    example: 'local health = 100\nlocal username = "Nova"\nlocal isAlive = true\nlocal target = nil',
    lines: [["100", "A number that can be used in arithmetic."], ['"Nova"', "A string containing text."], ["true", "A boolean representing true or false."], ["nil", "Represents the absence of a value."]],
    exercise: { prompt: "Declare a local boolean named isReady and set it to true.", starter: "local isReady = false", hint: "A boolean is written as true or false without quotation marks.", checks: ["local-isready-true"], solution: "local isReady = true" },
    quiz: { question: 'What type is the value "42"?', options: ["number", "string", "boolean"], answer: 1, explanation: "Quotation marks make it a string, even though the characters are digits." },
    mistakes: ["Writing true as \"true\" when you need a boolean.", "Trying to add nil to a number.", "Assuming two values that look alike have the same type."],
    studio: "Print each example and use typeof(value) to inspect its type.",
    summary: "Types describe values. Quotes matter, booleans are unquoted, and nil means no value.",
    reviewDays: 2
  },
  {
    id: "conditionals", path: "foundations", order: 4, title: "Making decisions with if", duration: "12 min", difficulty: "Beginner", xp: 60, tags: ["if", "elseif", "else"],
    intro: "Conditional statements let a script choose which instructions to run based on a true-or-false condition.",
    why: "Games constantly make decisions: does a player have enough coins, is a round over, or is an ability ready?",
    example: 'local coins = 30\nif coins >= 20 then\n    print("You can buy it")\nelse\n    print("Keep saving")\nend',
    lines: [["if coins >= 20 then", "Checks a condition and starts the matching branch."], ['print("You can buy it")', "Runs only when the condition is true."], ["else", "Provides an alternative branch."], ["end", "Closes the conditional."]],
    exercise: { prompt: "Write an if statement that checks whether coins is at least 10 and prints READY in that branch.", starter: "local coins = 12\nif coins >= 10 then\n    print(\"...\")\nend", hint: "Use >= for greater-than-or-equal and put READY in quotes.", checks: ["if-coins-gte-10", "contains-ready"], solution: 'local coins = 12\nif coins >= 10 then\n    print("READY")\nend' },
    quiz: { question: "What does else do?", options: ["Repeats a block", "Runs when earlier conditions did not match", "Declares a variable"], answer: 1, explanation: "else is the fallback branch when the if condition is false." },
    mistakes: ["Using = instead of == to compare values.", "Forgetting then or end.", "Checking a condition that can never be true."],
    studio: "Make a door open only if a player has a key variable set to true.",
    summary: "if, elseif, and else let your code choose a path. Conditions evaluate to booleans.",
    reviewDays: 2
  },
  {
    id: "loops", path: "foundations", order: 5, title: "Repeating work with loops", duration: "14 min", difficulty: "Beginner", xp: 60, tags: ["for", "while", "iteration"],
    intro: "Loops repeat a block of code. Numeric for loops are useful when you know the range; while loops continue while a condition remains true.",
    why: "Loops help process inventories, count rounds, animate values, and examine collections without duplicating code.",
    example: 'for number = 1, 3 do\n    print(number)\nend',
    lines: [["for number = 1, 3 do", "Starts a numeric loop from 1 through 3."], ["print(number)", "Runs once for each number."], ["end", "Closes the loop."]],
    exercise: { prompt: "Write a numeric for loop that counts from 1 to 5.", starter: "for number = 1, 3 do\n    print(number)\nend", hint: "Change the final number in the loop header to 5.", checks: ["for-1-to-5"], solution: "for number = 1, 5 do\n    print(number)\nend" },
    quiz: { question: "Which loop is a natural fit for counting from 1 to 10?", options: ["Numeric for loop", "if statement", "ModuleScript"], answer: 0, explanation: "A numeric for loop directly expresses a start and end value." },
    mistakes: ["Creating an infinite while loop without a yield or changing condition.", "Off-by-one ranges.", "Forgetting do or end."],
    studio: "Print the names of every child in a Folder using GetChildren() and a for loop.",
    summary: "Loops reduce repeated code. Choose a loop that clearly expresses the job.",
    reviewDays: 3
  },
  {
    id: "functions", path: "foundations", order: 6, title: "Functions and return values", duration: "15 min", difficulty: "Beginner", xp: 70, tags: ["function", "parameters", "return"],
    intro: "A function is a reusable block of code. Parameters provide input, and return sends a result back to the caller.",
    why: "Functions make systems easier to test, reuse, and change. A price calculation should not need to be rewritten in every button callback.",
    example: "local function add(a, b)\n    return a + b\nend\n\nprint(add(2, 3))",
    lines: [["local function add(a, b)", "Declares a local function with two parameters."], ["return a + b", "Sends the sum back to the caller."], ["end", "Closes the function body."], ["add(2, 3)", "Calls the function with two arguments."]],
    exercise: { prompt: "Create a local function named double that accepts n and returns n * 2.", starter: "local function double(n)\n    return n\nend", hint: "Return n multiplied by 2.", checks: ["function-double-return"], solution: "local function double(n)\n    return n * 2\nend" },
    quiz: { question: "What does return do?", options: ["Repeats a function", "Sends a value back to the caller", "Prints automatically"], answer: 1, explanation: "return provides a result and ends that function call." },
    mistakes: ["Printing a value when the caller needs a returned value.", "Calling a function without required arguments.", "Putting code after return when it should run."],
    studio: "Write a function that calculates the final price after a discount and test several inputs.",
    summary: "Functions package reusable logic. Parameters are inputs and return values are outputs.",
    reviewDays: 3
  },
  {
    id: "tables", path: "foundations", order: 7, title: "Tables: collections of values", duration: "16 min", difficulty: "Beginner", xp: 70, tags: ["tables", "pairs", "ipairs"],
    intro: "Tables are Luau's main general-purpose data structure. They can represent lists, dictionaries, and structured objects.",
    why: "Inventories, configuration, player stats, and NPC dialogue often use tables because one variable can organize many related values.",
    example: 'local inventory = {"Potion", "Key", "Map"}\nprint(inventory[1])\nfor index, item in ipairs(inventory) do\n    print(index, item)\nend',
    lines: [["{...}", "Creates a table."], ["inventory[1]", "Reads the first array-style item; Luau lists usually start at 1."], ["ipairs(inventory)", "Iterates sequential integer keys."], ["index, item", "Receives each key and value."]],
    exercise: { prompt: "Create a table named items with \"Key\" as its first item.", starter: 'local items = {"Potion"}', hint: "Use curly braces and put the string in quotes.", checks: ["table-items-key"], solution: 'local items = {"Key"}' },
    quiz: { question: "What is the first index in a typical Luau array-style table?", options: ["0", "1", "-1"], answer: 1, explanation: "Luau list-style tables conventionally start at index 1." },
    mistakes: ["Assuming an empty table is the same as nil.", "Forgetting list indexes commonly start at 1.", "Modifying a table and forgetting other variables may reference that same table."],
    studio: "Create a simple inventory table and write a function that adds and removes items.",
    summary: "Tables organize related values. Use ipairs for sequential lists and pairs for general key-value iteration.",
    reviewDays: 4
  },
  {
    id: "instances", path: "roblox", order: 1, title: "Instances and the Explorer", duration: "14 min", difficulty: "Beginner", xp: 70, tags: ["Instance", "Parent", "Workspace"],
    intro: "Most objects you see in Roblox Studio are Instances arranged in a parent-child tree called the DataModel. Explorer shows this hierarchy.",
    why: "Knowing where an object lives helps you find it from a script and choose the right place to create or store it.",
    example: 'local part = Instance.new("Part")\npart.Name = "PracticePart"\npart.Parent = workspace',
    lines: [["Instance.new(\"Part\")", "Creates a Part instance."], ["part.Name = ...", "Sets a readable name."], ["part.Parent = workspace", "Parents the part into Workspace so it exists in the 3D world."]],
    exercise: { prompt: "Create a Part instance, name it PracticePart, and parent it to workspace.", starter: 'local part = Instance.new("Part")\npart.Parent = workspace', hint: "Set the Name property before assigning Parent.", checks: ["instance-part", "practicepart", "parent-workspace"], solution: 'local part = Instance.new("Part")\npart.Name = "PracticePart"\npart.Parent = workspace' },
    quiz: { question: "What does Parent represent?", options: ["The object's location in the hierarchy", "Its material only", "A player's username"], answer: 0, explanation: "Parent links an Instance to its place in the DataModel tree." },
    mistakes: ["Creating an Instance and never parenting it.", "Putting server-only logic in a LocalScript.", "Using a name lookup that does not match the Explorer object."],
    studio: "Create a Part through a Script and inspect its location in Explorer.",
    summary: "Instances are Roblox objects. Parent determines where an object sits in the DataModel.",
    reviewDays: 4
  },
  {
    id: "events", path: "roblox", order: 2, title: "Properties, methods, and events", duration: "15 min", difficulty: "Beginner", xp: 80, tags: ["events", "Connect", "Touched"],
    intro: "Properties describe an object, methods perform actions, and events signal that something happened.",
    why: "Event-driven code reacts to players and the world without constantly checking every object.",
    example: 'local part = workspace:WaitForChild("Trigger")\npart.Touched:Connect(function(hit)\n    print(hit.Name)\nend)',
    lines: [["WaitForChild", "Waits for a named child to appear."], ["Touched", "An event fired when a part is touched."], [":Connect(function(hit)", "Subscribes a callback that receives the touching part."]],
    exercise: { prompt: "Connect a part's Touched event to a function that prints hit.Name.", starter: 'part.Touched:Connect(function(hit)\n    print("touch")\nend)', hint: "The event callback receives the touching part as hit.", checks: ["touched-connect", "hit-name"], solution: 'part.Touched:Connect(function(hit)\n    print(hit.Name)\nend)' },
    quiz: { question: "What does Connect do for an event?", options: ["Subscribes a callback", "Deletes the event", "Saves a DataStore"], answer: 0, explanation: "Connect registers a function to run when the event fires." },
    mistakes: ["Forgetting to disconnect long-lived connections when appropriate.", "Assuming every touched part belongs to a player character.", "Trusting client events for important server decisions."],
    studio: "Build a touch trigger and make it print the name of the part that touched it.",
    summary: "Properties describe, methods act, and events let code react.",
    reviewDays: 5
  },
  {
    id: "client-server", path: "roblox", order: 3, title: "Client and server", duration: "18 min", difficulty: "Intermediate", xp: 90, tags: ["replication", "LocalScript", "Script"],
    intro: "Roblox experiences run client code for each player and server code for shared authoritative game state. They have different responsibilities and visibility.",
    why: "The server should own valuable decisions such as currency, damage, trading, and rewards. Clients can request actions, but requests must be validated.",
    example: "local ReplicatedStorage = game:GetService(\"ReplicatedStorage\")\nlocal BuyItem = ReplicatedStorage:WaitForChild(\"BuyItem\")\n\nBuyItem.OnServerEvent:Connect(function(player, itemId)\n    if itemId ~= \"StarterSword\" then\n        return\n    end\n    print(player.Name, \"requested a starter sword\")\nend)",
    lines: [["GetService", "Retrieves a Roblox service."], ["OnServerEvent", "Receives a client RemoteEvent request and the sending Player."], ["Validate itemId", "Never trust a client to decide what an item costs or whether it can be purchased."]],
    exercise: { prompt: "Write a server event handler that rejects an itemId unless it equals StarterSword.", starter: 'BuyItem.OnServerEvent:Connect(function(player, itemId)\n    print(itemId)\nend)', hint: "Add an if check and return when the value does not match.", checks: ["onserverevent", "itemid", "starter-sword", "return"], solution: 'BuyItem.OnServerEvent:Connect(function(player, itemId)\n    if itemId ~= "StarterSword" then\n        return\n    end\nend)' },
    quiz: { question: "Where should authoritative currency changes happen?", options: ["Only in a LocalScript", "On the server after validation", "In a UI label"], answer: 1, explanation: "The server must validate and own important game state." },
    mistakes: ["Trusting a client-supplied price.", "Assuming ReplicatedStorage contents are secret.", "Confusing UI feedback with an authoritative purchase."],
    studio: "Create a RemoteEvent in ReplicatedStorage. Use a LocalScript to request an action and a server Script to validate it.",
    summary: "Clients handle local experience; servers validate and own important game state.",
    reviewDays: 5
  },
  {
    id: "modules-types", path: "systems", order: 1, title: "ModuleScripts and Luau types", duration: "20 min", difficulty: "Intermediate", xp: 100, tags: ["ModuleScript", "types", "require"],
    intro: "A ModuleScript returns a value, commonly a table of functions. Type annotations help tools catch mistakes and explain the shape of data.",
    why: "Modules let large projects share clear, testable APIs instead of keeping everything in one script.",
    example: "local MathUtil = {}\n\nfunction MathUtil.double(value: number): number\n    return value * 2\nend\n\nreturn MathUtil",
    lines: [["local MathUtil = {}", "Creates a table to hold the module's public API."], ["value: number", "Annotates the parameter type."], ["): number", "Annotates the return type."], ["return MathUtil", "Makes the table available to require()."]],
    exercise: { prompt: "Write a function named double with a number parameter and number return type.", starter: "local function double(value)\n    return value\nend", hint: "Add : number after value and after the closing parenthesis.", checks: ["function-double-return", "value:number", "):number"], solution: "local function double(value: number): number\n    return value * 2\nend" },
    quiz: { question: "What does require(ModuleScript) usually return?", options: ["The module's returned value", "A new server", "A GUI automatically"], answer: 0, explanation: "require returns the value returned by the ModuleScript." },
    mistakes: ["Forgetting to return the module's public API.", "Creating circular module dependencies.", "Treating type annotations as runtime input validation."],
    studio: "Create a ModuleScript that exports a function and call it from a Script.",
    summary: "Modules expose reusable APIs. Types improve static checking but do not replace runtime validation.",
    reviewDays: 7
  },
  {
    id: "gui", path: "systems", order: 2, title: "Building a responsive GUI", duration: "22 min", difficulty: "Intermediate", xp: 100, tags: ["ScreenGui", "UDim2", "Activated"],
    intro: "Roblox UI uses GuiObjects such as Frames, TextLabels, and TextButtons. UDim2 combines scale and pixel offsets for sizing and positioning.",
    why: "A responsive interface should adapt to different screens and provide clear feedback to mouse, touch, and gamepad users.",
    example: 'local button = script.Parent\nbutton.Activated:Connect(function()\n    button.Text = "Selected!"\nend)',
    lines: [["script.Parent", "References the object containing the script."], ["Activated", "A cross-input event suitable for buttons."], ["button.Text", "Updates the visible label."]],
    exercise: { prompt: "Connect button.Activated to a callback that changes the button text to Selected!", starter: 'button.Activated:Connect(function()\n    button.Text = "Click"\nend)', hint: "Change the string assigned to button.Text.", checks: ["activated-connect", "button.text", "selected!"], solution: 'button.Activated:Connect(function()\n    button.Text = "Selected!"\nend)' },
    quiz: { question: "Why use Activated for a button?", options: ["It supports multiple input types", "It saves player data", "It runs only on the server"], answer: 0, explanation: "Activated is designed for common button activation across input types." },
    mistakes: ["Hardcoding all layout in pixels.", "Forgetting UI constraints and anchor points.", "Putting server-authoritative economy logic in a LocalScript."],
    studio: "Build a ScreenGui with a TextButton. Use scale-based UDim2 values and test different viewport sizes.",
    summary: "Build accessible UI with responsive sizing and Activated for button input.",
    reviewDays: 7
  },
  {
    id: "datastores", path: "engineering", order: 1, title: "Saving player data safely", duration: "24 min", difficulty: "Advanced", xp: 120, tags: ["DataStoreService", "pcall", "retry"],
    intro: "DataStoreService stores data between sessions. Network operations can fail, so production systems need error handling, careful update patterns, and clear ownership.",
    why: "Losing inventory or currency damages player trust. Saving needs to account for failures, concurrent servers, and shutdowns.",
    example: 'local DataStoreService = game:GetService("DataStoreService")\nlocal CoinsStore = DataStoreService:GetDataStore("PlayerCoinsV1")\n\nlocal success, result = pcall(function()\n    return CoinsStore:GetAsync(tostring(player.UserId))\nend)\n\nif success then\n    print(result)\nelse\n    warn("Could not load player data")\nend',
    lines: [["GetDataStore", "Gets a named store."], ["pcall", "Catches an error so the script can respond."], ["GetAsync", "Loads a value for a key; it can fail."], ["success", "Tells you whether the operation completed without throwing."]],
    exercise: { prompt: "Use pcall around a DataStore GetAsync call.", starter: "local success, result = pcall(function()\n    return store:GetAsync(key)\nend)", hint: "The call belongs inside the function passed to pcall.", checks: ["pcall", "getasync", "return"], solution: "local success, result = pcall(function()\n    return store:GetAsync(key)\nend)" },
    quiz: { question: "Why wrap a DataStore request in pcall?", options: ["To prevent every possible data loss", "To handle errors without crashing the surrounding flow", "To make the request instant"], answer: 1, explanation: "pcall lets the script detect an error and choose a safe recovery path." },
    mistakes: ["Assuming a request can never fail.", "Overwriting newer data with stale snapshots.", "Saving unvalidated client-provided balances."],
    studio: "Enable Studio API access in a test place and build a small save/load flow with pcall and safe defaults.",
    summary: "Treat persistence as fallible. Validate data, handle errors, and plan for concurrent updates.",
    reviewDays: 7
  }
];

export function getLesson(id) {
  return lessons.find(lesson => lesson.id === id);
}

export function evaluateExercise(lesson, source) {
  if (typeof source !== "string" || source.length > 12000) return { passed: false, feedback: "Keep your solution under 12,000 characters." };
  const code = source.toLowerCase().replace(/\s+/g, "").replace(/['"]/g, '"');
  const checks = lesson.exercise.checks;
  const results = checks.map(check => {
    if (check === "print-call") return /\bprint\s*\(/i.test(source);
    if (check === "contains-text") return source.includes(lesson.exercise.expectedText);
    if (check === "local-coins-25") return /localcoins=25/.test(code);
    if (check === "print-coins") return /print\(coins\)/.test(code);
    if (check === "local-isready-true") return /localisready=true/.test(code);
    if (check === "if-coins-gte-10") return /ifcoins>=10then/.test(code);
    if (check === "contains-ready") return source.includes("READY");
    if (check === "for-1-to-5") return /for[a-z_]\w*=1,5do/.test(code) || /fornumber=1,5do/.test(code);
    if (check === "function-double-return") return /functiondouble\(n\).*returnn\*2/s.test(code) || /functiondouble\(value.*returnvalue\*2/s.test(code);
    if (check === "table-items-key") return /localitems=\{"key"\}/.test(code);
    if (check === "instance-part") return /instancenew\("part"\)/.test(code);
    if (check === "practicepart") return /practicepart/.test(code);
    if (check === "parent-workspace") return /parent=workspace/.test(code);
    if (check === "touched-connect") return /touched:connect/.test(code);
    if (check === "hit-name") return /print\(hit\.name\)/.test(code);
    if (check === "onserverevent") return /onserverevent:connect/.test(code);
    if (check === "itemid") return /itemid/.test(code);
    if (check === "starter-sword") return /"startersword"/.test(code);
    if (check === "return") return /return/.test(code);
    if (check === "value:number") return /value:number/.test(code);
    if (check === "):number") return /\):number/.test(code);
    if (check === "activated-connect") return /activated:connect/.test(code);
    if (check === "button.text") return /button\.text/.test(code);
    if (check === "selected!") return source.includes("Selected!");
    if (check === "pcall") return /pcall/.test(code);
    if (check === "getasync") return /getasync/.test(code);
    return false;
  });
  const passed = results.every(Boolean);
  return {
    passed,
    feedback: passed ? "Nice work. Your solution includes the required behavior for this exercise." : "Not quite yet. Check the required behavior, compare the hint with your code, and try again.",
    checksPassed: results.filter(Boolean).length,
    checksTotal: results.length
  };
}
