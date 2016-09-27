uiColors={}
mod_colors = angular.module 'mod_colors.js', []

mod_colors.run () ->

    htmlStyles = window.getComputedStyle(document.querySelector('html'))

    list=[ 'red', 'redtr', 'panel', 'pink', 'grey']
    uiColors={}
    for c in list
        uiColors[c]=htmlStyles.getPropertyValue('--words-' + c).trim()



    return
