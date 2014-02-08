(function (exports) {
    'use strict';

    var LINEBREAK = '\n', INDENT = '    ';

    exports.angular.module('builder.fileBuilder', [])
        .service('fileBuilder', FileBuilder);

    function FileBuilder() {
    }

    FileBuilder.prototype.build = function (gulp) {
        var content = [];

        content.push(buildDependencies(gulp));
        content.push(buildTasks(gulp));

        return content.join(LINEBREAK);
    };

    function buildDependencies(gulp) {
        var stepNames = getStepNames(gulp), content = [];

        // prepend default modules
        stepNames.unshift('util');

        stepNames.forEach(function (stepName) {
            content.push('var ' + normalizeStepName(stepName) + ' = require("gulp-' + stepName + '");');
        });

        // prepend gulp module
        content.unshift('var gulp = require("gulp");');

        return content.join(LINEBREAK);
    }

    function normalizeStepName(stepName) {
        var parts = stepName.split('-'), normalizedParts;

        normalizedParts = parts.map(function (part, index) {
            // skip first part - always!
            if (index === 0) { return part; }
            return (part.slice(0, 1).toUpperCase() + part.slice(1));
        });


        return normalizedParts.join('');
    }

    function getStepNames(gulp) {
        var steps = [], stepNames;

        gulp.tasks.forEach(function (task) {
            steps = steps.concat(task.steps);
        });

        stepNames = steps.map(function (step) {
            return step.name;
        });

        return getUniqueNames(stepNames);
    }

    function getUniqueNames(names) {
        var nameMap = {}, uniqueNames = [], name;

        names.forEach(function (name) {
            nameMap[name] = name;
        });

        for (name in nameMap) {
            if (nameMap.hasOwnProperty(name)) {
                uniqueNames.push(name);
            }
        }

        return uniqueNames;
    }

    function buildTasks(gulp) {
        return gulp.tasks.map(buildTask).join(LINEBREAK);
    }

    function buildTask(task) {
        var taskContent = [], preTasks = buildPreTasks(task);
        taskContent.push('gulp.task("' + task.name + '", [' + preTasks + '], {');
        taskContent.push(buildTaskContent(task));
        taskContent.push('});');

        return taskContent.join(LINEBREAK);
    }

    function buildPreTasks(task) {
        return task.preTasks.map(function (content) {
            return '"' + content + '"';
        }).join(', ');
    }

    function buildTaskContent(task) {
        var content = [];

        content.push('gulp.src(' + JSON.stringify(task.inputGlob) + ')');

        task.steps.forEach(function (step) {
            content.push(INDENT + buildStep(step));
        });

        content.push(INDENT + '.pipe(gulp.dest("' + task.outputDir + '"));');

        return content.map(function (line) {
            return INDENT + line;
        }).join(LINEBREAK);
    }

    function buildStep(step) {
        return '.pipe(' + normalizeStepName(step.name) + '(' + buildStepOptions(step) + '))';
    }

    function buildStepOptions(step) {
        return JSON.stringify(step.options);
    }

}(this));