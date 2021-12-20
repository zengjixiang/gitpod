#!/usr/bin/env bash

set -euo pipefail

#############
# Functions #
#############

# shellcheck disable=SC2034
function log() {
    local date_format="+%F %T"
    local date
    date="$(date "${date_format}")"

    local level="${1}"
    local msg="${2}"

    local color_DEBUG='\033[34m'  # Blue
    local color_INFO='\033[32m'   # Green
    local color_WARN='\033[33m'   # Yellow
    local color_ERROR='\033[31m'  # Red
    local color_DEFAULT='\033[0m' # Default

    local upper
    upper="$(echo "${level}" | awk '{print toupper($0)}')";
    local color_var="color_${upper}"
    local color="${!color_var:-\033[31m}";

    local output="${date} [${upper}] ${msg}";
    output="${color}${output}${color_DEFAULT}"

    case "${level}" in
        "debug")
            show_debug="${GVM_DEBUG:-0}"
            if [ "${show_debug}" -gt 0 ]; then
                echo -e "${output}" >&2
            fi
            ;;
        "info"|"warn")
            echo -e "${output}"
            ;;
        "error")
            echo -e "${output}" >&2
            exit 1
            ;;
        *)
            log "error" "Unknown log level: ${*}"
            ;;
    esac
}

# @todo
function gvm_help() {
    log "warn" "get the help"
}

function gvm_install() {
    VERSION="${1:-}"

    if [ -z "${VERSION}" ]; then
        log "error" "Version is a required field"
    fi
    echo "${VERSION}"
}

# @todo
function gvm_version() {
    log "warn" "get the version of this file"
}

################
# Begin script #
################

declare cmd="${1:-""}"

log "debug" "Setting GVM_DIR to ${PWD}"
export GVM_DIR="${PWD}"

log "debug" "gvm command is: ${cmd}"

case "${cmd}" in
    "")
        log "debug" "No command provided - displaying version, help and exiting"
        {
            gvm_version
            gvm_help
        } && exit 1
        ;;
    -v | --version )
        log "debug" "Version requested"
        gvm_version
        ;;
    -h | --help )
        log "debug" "Help requested"
        gvm_help
        ;;
    install )
        log "debug" "Running install command"
        shift 1
        gvm_install "${@}"
        ;;
    *)
        log "error" "Unknown command: ${cmd}"
esac