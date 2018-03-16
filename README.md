sshfs-config
============

A simple node-based command-line tool for mounting [sshfs](https://wiki.archlinux.org/index.php/SSHFS) hosts quickly and easily by making use of a config file.

For example:

```
$ sshfs-config host1
```

instead of

```
$ sshfs remoteuser@host1:/homes/remoteuser /Users/localuser/Remotes/ -o IdentityFile="~/.ssh/id_rsa",idmap=user,noappledouble
```


Prerequisites
-------------

You must have `sshfs` already installed and working on your system.


Installation
------------

```
$ [sudo] npm install sshfs-config -g
```


Config
------

Create the config file `config.json` at the following path: `~/.config/sshfs-config/`.

The config file must contain two top-level keys: `defaults` and `hosts`. Use `hosts` to define config for each host and `defaults` to define default config to be applied to each host.

`defaults` and `hosts` can optionally contain `options` and `flags` keys. The `options` key can be used to define any number of named or unnamed `sshfs` [options](https://jlk.fjfi.cvut.cz/arch/manpages/man/sshfs.1). The `flags` key can be used to specify any other available flags.

The config for a given host will be resolved into a set of options used to create the underlying `sshfs` call.

The environment variable `$HOME` or shortcut `~` can be used to define the `mountpoint` local path value. `sshfs-config` will attempt to create a non-existent mountpoint.

For additional flexibility, the config file can be self-referencing - i.e.: values within a host's config can be referenced by enclosing a dot-separated path to the relevant key inside a set of braces. **N.B.** The base node of a self-referenced path should be relative to the individual host config, not the entire config object.


```JSON
{
  "defaults": {
    "mountpoint": "$HOME/Remotes/{{ volume }}",
    "options": {
      "IdentityFile": "~/.ssh/id_rsa",
      "idmap": "user",
      "volname": "{{ volume }}",
      "anon": [
        "noappledouble"
      ]
    },
    "flags": {
      "-p": 2222,
      "-s": null
    }
  },
  "hosts": {
    "host1": {
      "user": "user1",
      "host": "url",
      "volume": "vol1",
      "target": "/homes/{{ user }}"
    }
  }
}
```


Usage
-----

Once installed and a config file has been created, the CLI app can be invoked using either `sshfs-config`, or its shorter alias `sshfsc`.

### Connect a filesystem

To connect to a defined host simply issue the command as you would using a configured `ssh` host:

```
$ sshfsc host1
```

### Print the config file

Use of the `-c` option will print out the entire config file - unresolved - or, if a valid host is specified as an argument, will print out the resolved config for that host. For example, based on the example config above,

```
$ sshfs-config -c
```

will print out the raw, unresolved config file. Whereas

```
$ sshfs-config -c host1
```

will print out something like this:

```JSON
{
  "host1": {
    "options": {
      "IdentityFile": "~/.ssh/id_rsa",
      "idmap": "user",
      "volname": "vol1",
      "anon": [
        "noappledouble"
      ]
    },
    "flags": {
      "-p": 2222,
      "-s": null
    },
    "user": "user1",
    "host": "url",
    "volume": "vol1",
    "target": "/homes/user1",
    "mountpoint": "/Users/localuser/Remotes/vol1"
  }
}
```

### List configured hosts

Print out a list of all configured hosts with the `-l` option:


```
$ sshfsc -l
```

### Other options

There are also `-h` and `-V` options, as per convention.

### Final word

`sshfs-config` does not work without a config file. Why would it!?
