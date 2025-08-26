from django.shortcuts import render

# Create your views here.
def index(request):
    context = {'titulo_pagina': 'Formulário de Cadastro'}
    return render(request, 'cadastro/index.html', context)
