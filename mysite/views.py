
from django.http import HttpResponse
from django.template import RequestContext, loader
from django.db import models
from django.template import Context, Template

def main(request):
	template = loader.get_template('mysite/index.html')
	context = RequestContext(request,{})
	return HttpResponse(template.render(context))