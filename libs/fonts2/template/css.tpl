@font-face{
	font-family:'<%= fontfileName %>';
	src:url('./fonts/<%= fontfileName %>.eot');
	src:url('./fonts/<%= fontfileName %>.eot?#iefix') format('embedded-opentype'),
		url('./fonts/<%= fontfileName %>.woff') format('woff'),
		url('./fonts/<%= fontfileName %>.woff2') format('woff2'),
		url('./fonts/<%= fontfileName %>.ttf') format('truetype'),
		url('./fonts/<%= fontfileName %>.svg') format('svg');
	font-weight:normal;
	font-style:normal;
}
.<%= fontfileName %>{
	font-family:'<%= fontfileName %>';
	speak:none;
	font-style: normal;
	font-weight: normal;
	font-variant: normal;
	text-transform: none;
	line-height: 1;
	-webkit-font-smoothing:antialiased;
	-moz-osx-font-smoothing:grayscale;
	font-size: 16px;
}
<% for (let i = 0; i < charmap.length; i++) { %>
.<%= fontfileName %>-<%=charmap[i].name%>:before{content:'<%=charmap[i].cssCode%>';}
<% } %>
