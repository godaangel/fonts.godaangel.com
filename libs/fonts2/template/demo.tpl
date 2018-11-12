<!DOCTYPE HTML>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title><%= fontfileName %></title>
<style type="text/css">
html,body,ul,li,h3,p{padding:0;margin:0;}
ul,li{list-style:none;}
.main{width:985px;margin:20px auto 0;}
.fontsList{margin-bottom:30px;overflow:hidden;}
.fonts {
    width: 10%;
    float: left;
}
.fonts > div {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    text-align: center;
}
.fonts h3 {
    text-align: center;
    padding: 3px;
    font-size: 14px;
    background-color: #eee;
    border-bottom: 1px solid #fff;
}
.<%= fontfileName %>{font-size:16px;	margin: 10px;}

/* css */
<%= cssStyle %>
/* css */
</style>
</head>
<body>

<div class="main">
	<h1><%= fontfileName %></h1>
	<h2>预览 Preview</h2>
	<ul class="fontsList" id="fontsList">
	<% for (let i = 0; i < charmap.length; i++) { %>
	<li class="fonts" data-id="<%=charmap[i].name%>">
    <div>
      <h3><%=charmap[i].cssCode%></h3>
      <div class="<%= fontfileName %> <%= fontfileName %>-<%=charmap[i].name%>"></div>
    </div>
	</li>
  <% } %>
	</ul>
<h2>CSS</h2>
<pre class="code css" contenteditable="true"><%= cssStyle %></pre>
</div>
</body>
</html>
